import { Component, ElementRef, HostListener, viewChild, ViewChild, ViewChildren } from '@angular/core';
import * as _ from 'lodash';

type Point  = {
    x: number,
    y: number,
}

const SCROLL_GAP = 12.617
const WHEEL_SCROLL_SPREED = 3
const MAX_SCROLL = 94.16
const MIN_SCROLL = 5.84

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private mousePos: Point = {x:0, y:0};
    private mouseDownPos: Point = {x:0, y:0};
    private isDown: boolean = false;
    private oldScrollPercent: number = 0;
    private currentScrollPercent = 0
    private isModeFullScreen = false
    private canScroll = true
    private titles = ["The Regeneration Suite", "1", "2", "3", "4", "5", "6", "7"]


    private bigImage: HTMLElement = {} as HTMLElement;
    private smallImage: HTMLElement = {} as HTMLElement;

    title = 'del';
    
    ngAfterViewInit() {
        for (const i of document.getElementsByClassName("image")) {
            i.addEventListener("click", this.handleImageClick.bind(this))
        }
        for (const i of document.getElementsByClassName("image-big")) {
            i.addEventListener("click", this.handleClickFullScreen.bind(this))
        }

        const tray = document.getElementById("tray-con")    
        if (!tray) return

        tray.animate(
            {
                transform: `translateX(-${MIN_SCROLL}%)`
            },
            {
                duration: 0,
                fill: "forwards"
            }
        )
        setImagePosition(MIN_SCROLL, 0)
    }

    @HostListener('document:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        if (this.isModeFullScreen) {
            this.unSetFullScreen()
            return
        }

        if (!this.canScroll) return
        
        let next = this.oldScrollPercent
        if ((e.deltaY < 0) || (e.deltaX < 0)) {
            next -= WHEEL_SCROLL_SPREED
        }
        if (e.deltaY > 0 || (e.deltaX > 0)) {
            next += WHEEL_SCROLL_SPREED
        }
        this.oldScrollPercent = clamp(next, MIN_SCROLL, MAX_SCROLL)
        this.updateTrackPos(this.oldScrollPercent)
    }

    @HostListener('document:mousedown', ['$event'])
    onMouseDown(e: MouseEvent) {
        this.mouseDownPos = {x: e.x, y: e.y}
        this.isDown = true
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (!this.isDown) return
        
        this.mousePos = {x: e.x, y: e.y}

        const localPercent = ((this.mouseDownPos.x - this.mousePos.x) / window.innerWidth) * 100
        const nextPercent = this.oldScrollPercent + localPercent
        const next = clamp(nextPercent, MIN_SCROLL, MAX_SCROLL)

        this.updateTrackPos(next)
        this.currentScrollPercent = next
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {
        this.oldScrollPercent = this.currentScrollPercent
        this.isDown = false
    }

    handleImageClick(e: Event) {
        const target = e.target as HTMLElement

        this.saveImagesOnThis(target.id)
        this.setFullScreen(target.id)
    }

    private setFullScreen(id: string) {
        copyImagePosition(this.smallImage, this.bigImage)
        this.bigImage.style.visibility = "visible"
        this.smallImage.style.visibility = "hidden"
        setImageFullScreen(this.bigImage)

        this.setTitle(id)

        this.isModeFullScreen = true
    }

    private setTitle(id: string) {
        const elem = document.getElementById(`title`)
        if (!elem) return

        elem.innerText = this.titles[Number(id)]

        elem.animate({
            transform: "translateY(0)"
        }, {
            delay: 200,
            easing: "ease-out",
            duration: 1000,
            fill: "forwards"
        })
    }

    private unSetTitle() {
        const elem = document.getElementById(`title`)
        if (!elem) return

        const animation = elem.animate({
            transform: "translateY(-200%)"
        }, {
            easing: "cubic-bezier(.3,1,0,.98)",
            duration: 700,
            fill: "forwards"
        })

        animation.finished.then(() => {
            elem.animate({
                transform: "translateY(200%)"
            }, {
                duration: 0,
                fill: "forwards"
            })
        })
    }

    private unSetFullScreen() {
        this.canScroll = false
        const localPercent = SCROLL_GAP * Number(this.smallImage.id) + MIN_SCROLL;

        this.updateTrackPos(localPercent, 500)
        this.oldScrollPercent = localPercent

        this.unSetTitle()

        this.unSetImageFullScreen()
        this.isModeFullScreen = false
    }

    private unSetImageFullScreen() {
        const rect = this.smallImage.getClientRects()[0]
        const animation = this.bigImage.animate(
            {
                height: `${rect.height}px`,
                width: `${rect.width}px`,
                top: `${(window.innerHeight / 2) - (rect.height / 2)}px`,
                left: `${(window.innerWidth / 2) - (rect.width / 2)}px`,
                objectPosition: 'center',
            },
            {
                easing: "cubic-bezier(.3,1,0,.98)",
                duration: 1000,
                fill: "forwards"
            }
        )
        animation.finished.then(this.unSetImageFullScreenOnFinish.bind(this));
    }

    private unSetImageFullScreenOnFinish() {
        this.canScroll = true
        this.smallImage.style.visibility = "visible"
        this.bigImage.style.visibility = "hidden"
    }

    // TODO
    handleClickFullScreen(e: Event) {
    }

 
    private saveImagesOnThis(id: string) {
        const smallImage = document.getElementById(id)
        if (!smallImage) return
        this.smallImage = smallImage
        
        const bigImage = document.getElementById(`${id}b`)
        if (!bigImage) return
        this.bigImage = bigImage
    }

    updateTrackPos(scrollPercent: number, duration?: number) {
        const tray = document.getElementById("tray-con")    
        if (!tray) return

        tray.animate(
            {
                transform: `translateX(-${scrollPercent}%)`
            },
            {
                duration: duration ?? 1200,
                fill: "forwards"
            }
        )
        setImagePosition(scrollPercent, duration ?? 1200)
    }
}

function clamp(num:number, min:number, max:number):number {
    if (num < min) return min
    if (num > max) return max
    return num
}

function setImagePosition(scrollPercent: number, animationDuration: number) {
    const imgContainers = document.getElementsByClassName("image") as  HTMLCollectionOf<HTMLElement>
    if (!imgContainers) return

    const array = Array.from(imgContainers)
    for (let i = 0 ; i <  array.length; ++i) {
        array[i].animate(
        {
            objectPosition: `${50 + MIN_SCROLL + (i * SCROLL_GAP) - scrollPercent}% center`
        },
        {
            duration: animationDuration,
            fill: "forwards"
        })
    }
}

function copyImagePosition(src:HTMLElement, dest:HTMLElement) {
    const rect = src.getClientRects()[0]

    dest.animate({
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top:  `${rect.top}px`,
        left: `${rect.left}px`,
        objectPosition: getComputedStyle(src).objectPosition
    },
    {
        duration: 0,
        fill: "forwards"
    })
}


function setImageFullScreen(image: HTMLElement) {
    image.animate(
        {
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: 5
        },
        {
            easing: "cubic-bezier(.3,1,0,.98)",
            duration: 1500,
            fill: "forwards"
        }
    )
}


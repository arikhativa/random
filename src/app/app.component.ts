import { Component, ElementRef, HostListener, viewChild, ViewChild, ViewChildren } from '@angular/core';
import * as _ from 'lodash';

type Point  = {
    x: number,
    y: number,
}

const SCROLL_GAP = 12.572
const WHEEL_SCROLL_SPREED = 3
const MAX_SCROLL = 94
const MIN_SCROLL = 6

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private mousePos: Point = {x:0, y:0};
    private mouseDownPos: Point = {x:0, y:0};
    private isDown: boolean = false;
    // private canScroll: boolean = true;
    private oldScrollPercent: number = 0;
    private currentScrollPercent = 0


    private bigImage: HTMLElement | undefined;
    private smallImage: HTMLElement | undefined;

    title = 'del';
    
    ngAfterViewInit() {
        for (const i of document.getElementsByClassName("image")) {
            i.addEventListener("click", this.handleImageClick.bind(this))
        }
        for (const i of document.getElementsByClassName("image-big")) {
            i.addEventListener("click", this.handleBigImageClick.bind(this))
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
        setObjectOption(MIN_SCROLL, 0)
    }

    handleBigImageClick(e: Event) {
        const target = e.target as HTMLElement

        const id = target.id.substring(0, 1);
        let bigImage = document.getElementById(`${id}b`)
        if (!bigImage) return
        
        const smallImage = document.getElementById(id)
        if (!smallImage) return

        const localPercent = SCROLL_GAP * Number(id) + 6;

        this.updateTrackPos(localPercent, 500)
        this.oldScrollPercent = localPercent

        const rect = smallImage.getClientRects()[0]
        
        const animation = bigImage.animate(
            {
                height: `${rect.height}px`,
                width: `${rect.width}px`,
                top: `${(window.innerHeight / 2) - (rect.height / 2)}px`,
                left: `${(window.innerWidth / 2) - (rect.width / 2)}px`,
                objectPosition: 'center',
            },
            {
                duration: 600,
                fill: "forwards"
            }
        )

        this.bigImage = bigImage
        this.smallImage = smallImage
        animation.finished.then(this.handleBigImageClickEnd.bind(this));
    }

    handleBigImageClickEnd() {
        // this.canScroll = true
     
        if (!this.bigImage || !this.smallImage) return

        this.smallImage.style.visibility = "visible"
        this.bigImage.style.visibility = "hidden"
    }

    handleImageClick(e: Event) {

        const target = e.target as HTMLElement

        const smallImage = document.getElementById(target.id)
        if (!smallImage) return

        let bigImage = document.getElementById(`${target.id}b`)
        if (!bigImage) return

        // this.canScroll = false

        copyImagePosition(smallImage, bigImage)
        
        bigImage.style.visibility = "visible"
        smallImage.style.visibility = "hidden"
        setImageFullScreen(bigImage)
    }
  
    @HostListener('document:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        // if (!this.canScroll) return

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
        // if (!this.canScroll) return
        this.mouseDownPos = {x: e.x, y: e.y}
        this.isDown = true
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        // if (!this.canScroll) return
        if (!this.isDown) return
        
        this.mousePos = {x: e.x, y: e.y}

        const maxScroll = window.innerWidth;

        const currentPos = this.mouseDownPos.x - this.mousePos.x;
        
        const localPercent = (currentPos / maxScroll) * 100
        
        const nextPercent = this.oldScrollPercent + localPercent

        const next = clamp(nextPercent, MIN_SCROLL, MAX_SCROLL)

        this.updateTrackPos(next)

        this.currentScrollPercent = next
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {
        // if (!this.canScroll) return
        this.oldScrollPercent = this.currentScrollPercent
        this.isDown = false
    }

    updateTrackPos(scrollPercent: number, duration?: number) {
        // if (!this.canScroll) return
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
        setObjectOption(scrollPercent, duration ?? 1200)
    }
}

function clamp(num:number, min:number, max:number):number {
    if (num < min) return min
    if (num > max) return max
    return num
}

function setObjectOption(scrollPercent: number, animationDuration: number) {
    const imgContainers = document.getElementsByClassName("image") as  HTMLCollectionOf<HTMLElement>
    if (!imgContainers) return

    const array = Array.from(imgContainers)
    for (let i = 0 ; i <  array.length; ++i) {
        array[i].animate(
        {
            objectPosition: `${56 + (i * SCROLL_GAP) - scrollPercent}% center`
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


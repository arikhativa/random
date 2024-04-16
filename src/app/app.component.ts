import { Component, ElementRef, HostListener, viewChild, ViewChild, ViewChildren } from '@angular/core';
import * as _ from 'lodash';

type Point  = {
    x: number,
    y: number,
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private mousePos: Point = {x:0, y:0};
    private mouseDownPos: Point = {x:0, y:0};
    private isDown: boolean = false;
    private canScroll: boolean = true;
    private oldScrollPercent: number = 0;
    private currentScrollPercent = 0
    private readonly WHEEL_SCROLL_SPREED = 5

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
        setObjectOption(0, 0)
    }

    handleBigImageClick(e: Event) {
        const target = e.target as HTMLElement

        const id = target.id.substring(0, 1);
        let bigImage = document.getElementById(`${id}b`)
        if (!bigImage) return
        
        const smallImage = document.getElementById(id)
        if (!smallImage) return

        const rect = smallImage.getClientRects()[0]
        
        const animation = bigImage.animate(
            {
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                objectPosition: getComputedStyle(smallImage).objectPosition,
            },
            {
                duration: 200,
                fill: "forwards"
            }
        )

        this.bigImage = bigImage
        this.smallImage = smallImage
        animation.finished.then(this.handleBigImageClickEnd.bind(this));
    }

    handleBigImageClickEnd() {
        this.canScroll = true
     
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

        this.canScroll = false


        copyImagePosition(smallImage, bigImage)
        
        bigImage.style.visibility = "visible"
        smallImage.style.visibility = "hidden"
        setImageFullScreen(bigImage)
    }
  
    @HostListener('document:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        if (!this.canScroll) return

        let next = this.currentScrollPercent
        if ((e.deltaY < 0) || (e.deltaX < 0)) {
            next -= this.WHEEL_SCROLL_SPREED
        }
        if (e.deltaY > 0 || (e.deltaX > 0)) {
            next += this.WHEEL_SCROLL_SPREED
        }
        this.currentScrollPercent = clamp(next, 0, 90)

        this.updateTrackPos(this.currentScrollPercent)
    }

    @HostListener('document:mousedown', ['$event'])
    onMouseDown(e: MouseEvent) {
        if (!this.canScroll) return
        this.mouseDownPos = {x: e.x, y: e.y}
        this.isDown = true
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (!this.canScroll) return
        if (!this.isDown) return
        
        this.mousePos = {x: e.x, y: e.y}

        const maxScroll = window.innerWidth;

        const currentPos = this.mouseDownPos.x - this.mousePos.x;
        
        const localPercent = (currentPos / maxScroll) * 100
        
        const nextPercent = this.oldScrollPercent + localPercent

        const next = clamp(nextPercent, 0, 90)

        this.updateTrackPos(next)

        this.currentScrollPercent = next
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {
        if (!this.canScroll) return
        this.oldScrollPercent = this.currentScrollPercent
        this.isDown = false
    }

    updateTrackPos(scrollPercent: number) {
        if (!this.canScroll) return
        const tray = document.getElementById("tray-con")    
        if (!tray) return

        tray.animate(
            {
                transform: `translateX(-${scrollPercent}%)`
            },
            {
                duration: 1200,
                fill: "forwards"
            }
        )
        setObjectOption(scrollPercent, 1200)
    }
}

function clamp(num:number, min:number, max:number):number {
    if (num < min) return min
    if (num > max) return max
    return num
}

function setObjectOption(scrollPercent: number, animationDuration: number) {
    const imgContainers = document.getElementsByClassName("image")    
    if (!imgContainers) return

    const array = Array.from(imgContainers)
    for (let i = 0 ; i <  array.length; ++i) {
        array[i].animate(
        {
            objectPosition: `${50 + (10 * i) - scrollPercent}% center`
        },
        {
            duration: animationDuration,
            fill: "forwards"
        })
    }
}

function copyImagePosition(src:HTMLElement, dest:HTMLElement) {
    const rect = src.getClientRects()[0]

    dest.style.width = `${rect.width}px`
    dest.style.height = `${rect.height}px`
    dest.style.top = `${rect.top}px`
    dest.style.left = `${rect.left}px`
    dest.style.objectPosition = getComputedStyle(src).objectPosition
}


function setImageFullScreen(image: HTMLElement) {
    image.animate(
        {
            width: "100%",
            height: "100%",
            top: 0,
            left: 0
        },
        {
            easing: "cubic-bezier(.3,1,0,.98)",
            duration: 1500,
            fill: "forwards"
        }
    )
}


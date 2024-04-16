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
    private oldScrollPercent: number = 0;
    private currentScrollPercent = 0
    private readonly WHEEL_SCROLL_SPREED = 5
    title = 'del';
    
    ngAfterViewInit() {
        const images = document.getElementsByClassName("image")
        for (const image of images) {
            image.addEventListener("click", this.handleImageClick)
        }
        setObjectOption(0, 0)
    }

    handleImageClick(e: Event) {
        const images = document.getElementsByClassName("image")
        const smallImage = images[0] as HTMLElement

        let bigImage = document.getElementById("bigImage")
        if (!bigImage) return

        const sRect = smallImage.getClientRects()[0]
        let bRect = bigImage.getClientRects()[0]
        bRect = sRect
        bigImage.style.width = `${sRect.width}px`
        bigImage.style.height = `${sRect.height}px`
        bigImage.style.top = `${sRect.top}px`
        bigImage.style.left = `${sRect.left}px`

        bigImage.style.objectPosition = getComputedStyle(smallImage).objectPosition
        bigImage.style.visibility = "visible"
        smallImage.style.visibility = "hidden"

        bigImage.animate(
            {
                width: "100%",
                height: "100%",
                top: 0,
                left: 0
            },
            {
                easing:"cubic-bezier(.3,1,0,.98)",
                duration: 1500,
                fill: "forwards"
            }
        )
    }
  
    @HostListener('document:wheel', ['$event'])
    onWheel(e: WheelEvent) {
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
        this.mouseDownPos = {x: e.x, y: e.y}
        this.isDown = true
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
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
        this.oldScrollPercent = this.currentScrollPercent
        this.isDown = false
    }

    updateTrackPos(scrollPercent: number) {
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
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
    title = 'del';
    
    ngAfterViewInit() {
        setObjectOption(0, 0)
    }
  
    @HostListener('document:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        let next = this.currentScrollPercent
        if ((e.deltaY < 0) || (e.deltaX < 0)) {
            next -= 1
        }
        if (e.deltaY > 0 || (e.deltaX > 0)) {
            next += 1
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
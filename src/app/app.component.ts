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

    constructor() {}
  
    @HostListener('document:mousedown', ['$event'])
    onMouseDown(e: MouseEvent) {
        this.mouseDownPos = {x: e.x, y: e.y}
        this.isDown = true
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (!this.isDown) return
        
        this.mousePos = {x: e.x, y: e.y}

        const maxScroll = window.innerWidth / 2;

        const curr = this.mouseDownPos.x - this.mousePos.x;
        
        const localPercent = (curr / maxScroll) * 100
        
        const nextPercent = this.oldScrollPercent + localPercent

        const next = clamp(nextPercent, 0, 100)

        const tray = document.getElementById("tray-con")
        if (!tray) return
        tray.style.transform = `translateX(-${next}%)`

        this.currentScrollPercent = next
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {
        this.oldScrollPercent = this.currentScrollPercent
        this.isDown = false
    }
}

function clamp(num:number, min:number, max:number):number {
    if (num < min) return min
    if (num > max) return max
    return num
}

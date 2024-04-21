import { Component, ElementRef, HostListener, Renderer2, viewChild, ViewChild, ViewChildren } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    @ViewChild("fsCon") fullScreenContainer!: ElementRef<HTMLDivElement>;
    @ViewChild("msCon") middleScreenContainer!: ElementRef<HTMLDivElement>;
    @ViewChild("image") image!: ElementRef<HTMLImageElement>;
    private a = true

    constructor(private renderer: Renderer2) {}

    ngAfterViewInit() {
        const pos = this.renderer.selectRootElement(this.image.nativeElement);
        console.log('pos', )
        
        
    }
    switch() {
        this.image.nativeElement.animate({
            position: "fixed",
            height: "10vh",
            width: "10vw",
            zIndex: "10",
            top: `0`
        }, {
            duration:0,
            fill: "forwards"
        })

        if (this.a) {
            this.renderer.removeChild(this.image.nativeElement.parentNode, this.image.nativeElement);
            this.renderer.appendChild(this.fullScreenContainer.nativeElement, this.image.nativeElement);
        } else {
            this.renderer.removeChild(this.image.nativeElement.parentNode, this.image.nativeElement);
            this.renderer.appendChild(this.middleScreenContainer.nativeElement, this.image.nativeElement);
        }
        this.a = !this.a
    }
}

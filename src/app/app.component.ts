import { Component, ElementRef, viewChild, ViewChild, ViewChildren } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    @ViewChild('cards') cards: ElementRef<HTMLElement> | undefined;
    title = 'del';
    ngAfterViewInit() {
        if (!this.cards) return
        this.cards.nativeElement.onmousemove = this.handleMouseMove;
    }

    handleMouseMove(e: MouseEvent) {
        const cards = Array.from(document.getElementsByClassName('card')) as HTMLElement[];
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    }
}

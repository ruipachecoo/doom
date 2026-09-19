import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DOOM } from 'wasm-doom';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {

  @ViewChild('gameCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private game: DOOM | null = null;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.drawInitialScreen(canvas, ctx);

    // Start DOOM without blocking ngAfterViewInit
    void this.startGame();

    // Try to focus the canvas early, in case the page is already active
    canvas.focus();
  }

  private async startGame(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;

    if (this.game) return;

    console.log('Loading DOOM...');

    try {
      this.game = new DOOM({
        screenWidth: canvas.width,
        screenHeight: canvas.height,
        enableLogs: false,
        keyboardTarget: canvas,
        onFrameRender: ({ screen }) => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const frame = new ImageData(screen, canvas.width, canvas.height);
          ctx.putImageData(frame, 0, 0);
        },
      });

      await this.game.start();
      console.log('DOOM is running.');

      // Re-focus after DOOM initializes (it may steal focus)
      canvas.focus();
    } catch (error) {
      console.error('Error while running DOOM:', error);
    }
  }

  private drawInitialScreen(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ready for DOOM', canvas.width / 2, canvas.height / 2);
  }
}

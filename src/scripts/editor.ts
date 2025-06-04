// The Custom Pen
import {
	pathToRenderable, Path, Stroke, ComponentBuilderFactory, Point2, Rect2, Color4, Viewport, StrokeDataPoint, RenderingStyle, PathCommandType, ComponentBuilder, AbstractRenderer, IconProvider, makeDropdownToolbar
} from 'js-draw';

///
/// Wavy Thickness Pen Builder
///
/// This class creates a smooth path whose thickness is modulated by a sine wave,
/// in addition to responding to pressure and speed for tapering.
///
class WavyThicknessPenBuilder implements ComponentBuilder {
	private segments: Array<{ path: Path; style: RenderingStyle }> = [];
	private lastPathEndPoint: Point2;
	private lastProcessedInputPoint: StrokeDataPoint & { rawPos: Point2 };

	private sizeOfScreenPixelOnCanvas: number;
	private accumulatedDistance: number = 0;

	// --- Made public for external controls via factory ---
	public thicknessSineAmplitude: number = 20;
	public thicknessSineFrequency: number = 0.01;
	public speedReductionFactor: number = 0.02; // Made public

	// --- Still private as they are more for internal clamping/behavior ---
	private minOverallStrokeWidth: number = 0;
	public maxSpeedForTapering: number = 200;


	public constructor(
		startPointData: StrokeDataPoint,
		sizeOfScreenPixelOnCanvas: number
	) {
		this.sizeOfScreenPixelOnCanvas = sizeOfScreenPixelOnCanvas;
		const roundedStartPos = this.roundPoint(startPointData.pos);

		this.lastPathEndPoint = roundedStartPos;
		this.lastProcessedInputPoint = {
			...startPointData,
			pos: roundedStartPos,
			rawPos: startPointData.pos,
		};
		this.accumulatedDistance = 0;

		const initialPressureWidth = startPointData.width;
		let initialEnvelopeWidth = initialPressureWidth;
		if (initialPressureWidth < 0.01) {
			initialEnvelopeWidth = 0;
		} else {
			initialEnvelopeWidth = Math.max(this.minOverallStrokeWidth, initialEnvelopeWidth);
		}
		const initialFinalWidth = initialEnvelopeWidth;

		this.segments.push({
			path: new Path(roundedStartPos, []),
			style: {
				fill: Color4.transparent,
				stroke: {
					color: startPointData.color,
					width: initialFinalWidth,
				},
			},
		});
	}

	private roundPoint(point: Point2): Point2 {
		return Viewport.roundPoint(point, this.sizeOfScreenPixelOnCanvas);
	}

	public getBBox(): Rect2 {
		if (this.segments.length === 0) {
			return new Rect2(this.lastPathEndPoint.x, this.lastPathEndPoint.y, 0, 0);
		}
		let overallBBox = this.segments[0].path.bbox;
		for (let i = 1; i < this.segments.length; i++) {
			overallBBox = overallBBox.union(this.segments[i].path.bbox);
		}
		return overallBBox;
	}

	public build(): Stroke {
		const renderables = this.segments.map(segment =>
			pathToRenderable(segment.path, segment.style)
		);
		return new Stroke(renderables);
	}

	public preview(renderer: AbstractRenderer) {
		const stroke = this.build();
		stroke.render(renderer);
	}

	public addPoint(newPointData: StrokeDataPoint) {
		const controlPos = this.lastProcessedInputPoint.pos; // Rounded
		const rawCurrentPos = newPointData.pos;
		const currentInputPos = this.roundPoint(rawCurrentPos); // Base for Bézier end

		const segmentEndPoint = this.roundPoint(controlPos.plus(currentInputPos).times(0.5));

		// Calculate length of the Bézier segment's "chord" for accumulatedDistance
		// This is an approximation; true arc length of Bézier is more complex.
		// For small segments, chord length is a decent proxy.
		const chordLength = segmentEndPoint.distanceTo(this.lastPathEndPoint);
		this.accumulatedDistance += chordLength;

		// 1. Calculate Speed
		let speed = 0;
		const deltaTime = newPointData.time - this.lastProcessedInputPoint.time;
		if (deltaTime > 1e-5) {
			const deltaDistance = rawCurrentPos.distanceTo(this.lastProcessedInputPoint.rawPos);
			speed = deltaDistance / deltaTime;
		}
		const cappedSpeed = Math.min(speed, this.maxSpeedForTapering);

		// 2. Calculate Envelope Stroke Width (Pressure modulated by Speed)
		const pressureWidth = newPointData.width;
		let envelopeWidth;
		if (pressureWidth < 0.01) { // If pressure is effectively zero
			envelopeWidth = 0;
		} else {
			envelopeWidth = pressureWidth / (1 + cappedSpeed * this.speedReductionFactor);
			envelopeWidth = Math.max(this.minOverallStrokeWidth, envelopeWidth); // Apply overall min
		}

		// 3. Apply Sine Wave Modulation to Thickness
		const phase = this.accumulatedDistance * this.thicknessSineFrequency;
		const thicknessOffset = this.thicknessSineAmplitude * Math.sin(phase);
		let finalWidth = envelopeWidth + thicknessOffset;
		finalWidth = Math.max(0, finalWidth); // Ensure width is not negative and can be 0

		// Handle stationary or very short segments primarily by updating style
		if (segmentEndPoint.eq(this.lastPathEndPoint) || chordLength < this.sizeOfScreenPixelOnCanvas * 0.5) {
			if (this.segments.length > 0) {
				const lastSegmentIndex = this.segments.length - 1;
				const lastSegmentData = this.segments[lastSegmentIndex];
				if (Math.abs(lastSegmentData.style.stroke!.width - finalWidth) > 0.001 ||
					!lastSegmentData.style.stroke!.color.eq(newPointData.color)) {
					this.segments[lastSegmentIndex] = {
						...lastSegmentData,
						style: {
							...lastSegmentData.style,
							stroke: { color: newPointData.color, width: finalWidth }
						}
					};
				}
			}
			this.lastProcessedInputPoint = { ...newPointData, pos: currentInputPos, rawPos: rawCurrentPos };
			// lastPathEndPoint remains the same if segmentEndPoint didn't move
			return;
		}

		const segmentPath = new Path(this.lastPathEndPoint, [{
			kind: PathCommandType.QuadraticBezierTo,
			controlPoint: controlPos,
			endPoint: segmentEndPoint,
		}]);

		const segmentStyle: RenderingStyle = {
			fill: Color4.transparent,
			stroke: {
				color: newPointData.color,
				width: finalWidth,
			},
		};
		this.segments.push({ path: segmentPath, style: segmentStyle });

		this.lastPathEndPoint = segmentEndPoint;
		this.lastProcessedInputPoint = { ...newPointData, pos: currentInputPos, rawPos: rawCurrentPos };
	}
}

///
/// The custom ComponentBuilderFactory
///
export const makeWavyThicknessPenBuilder: ComponentBuilderFactory =
	(initialPoint: StrokeDataPoint, viewport: Viewport) => {
		const sizeOfScreenPixelOnCanvas = viewport.getSizeOfPixelOnCanvas();
		// Create a new builder instance for each stroke
		const builder = new WavyThicknessPenBuilder(initialPoint, sizeOfScreenPixelOnCanvas);

		// Read values from HTML controls when a new stroke begins
		// Ensure these properties are public in WavyThicknessPenBuilder or settable via constructor/methods
		// const ampSlider = document.getElementById('jsDrawThicknessAmplitude') as HTMLInputElement;
		// if (ampSlider) {
		// 	builder.thicknessSineAmplitude = parseFloat(ampSlider.value);
        //     console.log("Thickness Wave Amplitude: " + builder.thicknessSineAmplitude);
		// }

		// const freqSlider = document.getElementById('jsDrawThicknessFrequency') as HTMLInputElement;
		// if (freqSlider) {
		// 	builder.thicknessSineFrequency = parseFloat(freqSlider.value);
        //     console.log("Thickness Wave Frequency: " + builder.thicknessSineFrequency);
		// }

		// const speedFactorSlider = document.getElementById('jsDrawSpeedFactor') as HTMLInputElement;
		// if (speedFactorSlider) {
			// To make this work, 'speedReductionFactor' would need to be public
			// or passed into the constructor of WavyThicknessPenBuilder.
			// For now, let's assume you'll make it public if you want it controlled this way:
		// 	builder.speedReductionFactor = parseFloat(speedFactorSlider.value);
        //     console.log("Speed Taper Factor: " + builder.speedReductionFactor);
		// }
		return builder;
    };

class CustomIconProvider extends IconProvider {
    // Use '☺' instead of the default dropdown symbol.
    public override makeDropdownIcon() {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.innerHTML = `
            <text x='5' y='55' style='fill: var(--icon-color);'>☺</text>
        `;
        icon.setAttribute('viewBox', '0 0 100 100');
        return icon;
    }
}


// The Editor
import { Editor } from 'js-draw';
import 'js-draw/styles';

// Target the new wrapper div
const containerElement = document.getElementById('editor-wrapper');
const icons = new CustomIconProvider();

// Create an Editor with some custom settings
const editor = containerElement ? new Editor(containerElement, {
	wheelEventsEnabled: 'only-if-focused',
	minZoom: 0.1,
	maxZoom: 10,
	pens: {
		additionalPenTypes: [{
			name: 'Wavy', // Updated Pen Name
			id: 'wavy-thickness-pen',   // Updated Pen ID
			factory: makeWavyThicknessPenBuilder, // Use the new builder factory
			isShapeBuilder: false,
		}],
	},
	iconProvider: icons,
}) : null;

if (editor) {
    const addToHistory = false;
    editor.dispatch(editor.image.setAutoresizeEnabled(true), addToHistory);
    editor.dispatch(editor.setBackgroundStyle({ autoresize: true }), addToHistory);

	makeDropdownToolbar(editor).addDefaults();

    // const toolbar = editor.addToolbar();

    // toolbar.addSaveButton(() => {
	// 	const saveData = editor.toSVG().outerHTML;
	// 	const blob = new Blob([saveData], { type: 'image/svg+xml' });
	// 	const url = URL.createObjectURL(blob);
	// 	const a = document.createElement('a');
	// 	a.href = url;
	// 	a.download = 'drawing.svg';
	// 	document.body.appendChild(a);
	// 	a.click();
	// 	document.body.removeChild(a);
	// 	URL.revokeObjectURL(url);
	// 	console.log('SVG data prepared for download:', saveData);
    // });

    const downloadArtworkButton = document.getElementById('downloadArtworkButton');
    if (downloadArtworkButton) {
        downloadArtworkButton.addEventListener('click', () => {
            const saveData = editor.toSVG().outerHTML; //
            const blob = new Blob([saveData], { type: 'image/svg+xml' }); //
            const url = URL.createObjectURL(blob); //
            const a = document.createElement('a'); //
            a.href = url; //
            a.download = 'drawing.svg'; //
            document.body.appendChild(a); //
            a.click(); //
            document.body.removeChild(a); //
            URL.revokeObjectURL(url); //
            console.log('SVG data prepared for download:', saveData); //
        });
    }

	const saveToGalleryButton = document.getElementById('saveToGalleryButton');
    if (saveToGalleryButton) {
        saveToGalleryButton.addEventListener('click', async () => {
            const svgData = editor.toSVG().outerHTML;
            try {
                const response = await fetch('http://10.101.0.126:3000/api/uploadImage', { // Use your backend URL/port
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ svgData: svgData }),
                });
                const result = await response.json();
                if (response.ok) {
                    // Simple toast: alert(result.message);
                    console.log('Success:', result.message);
                    // Implement a nicer toast/notification here
                    alert(`Success: ${result.message}. Submission ID: ${result.submissionId || 'N/A'}`);
                } else {
                    // Simple toast: alert(`Error: ${result.message}`);
                    console.error('Error:', result.message);
                    alert(`Error: ${result.message}`);
                }
            } catch (error) {
                console.error('Network error:', error);
                // Simple toast: alert('Network error. Please try again.');
                alert('Network error. Please try again.');
            }
        });
    }

    if (containerElement && typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => {
            console.log('Editor wrapper resized.');
        });
        resizeObserver.observe(containerElement);
    }
} else {
    if (containerElement) {
        containerElement.innerHTML = '<p style="color: red; text-align: center;">Error initializing the editor.</p>';
    }
}

// Todo:
// -----------------------------------------------------------------------------
// 1. (Implemented) Wavy thickness pen with speed-dependent tapering.
// 2. Save the images to a filesystem. (SVG download is implemented)
// 3. Test on mobile device and style accordingly.
// 4. Next, go move on to the gallery.

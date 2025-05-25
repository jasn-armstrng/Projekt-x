import Editor from 'js-draw';
import 'js-draw/styles';

// Features of js-draw
// -----------------------------------------------------------------------------
//  1. Customizable pens
//      - Color
//      - thickness
//      - stabilization
//      - pressure
//      - shapes
//      - Auto correct for shapes
//  2. Create new pens
//  3. Eraser
//  4. Upload background image
//  5. Save background image to disk
//  6. Stylable window
// -----------------------------------------------------------------------------

// Target the new wrapper div
const containerElement = document.getElementById('editor-wrapper');

// Add your custom class to the wrapper for styling via existing media queries if needed
if (containerElement) {
    containerElement.classList.add('my-js-draw-editor');
} else {
    console.error("Error: Could not find #editor-wrapper element.");
    // Fallback or error handling if the wrapper isn't found
}

// Create an Editor with some custom settings
// Ensure containerElement is valid before creating the editor
const editor = containerElement ? new Editor(containerElement, {
  wheelEventsEnabled: 'only-if-focused', // Only zoom with wheel if editor has focus
  minZoom: 0.1, // Allow zooming out to 10%
  maxZoom: 10,  // Allow zooming in to 1000%
  // ... other settings
}) : null;

if (editor) {
    // Make the background fill the editor viewport (different from canvas size)
    const addToHistory = false;
    editor.dispatch(editor.image.setAutoresizeEnabled(true), addToHistory);
    editor.dispatch(editor.setBackgroundStyle({ autoresize: true }), addToHistory);

    // Add save image button
    const toolbar = editor.addToolbar();
    toolbar.addSaveButton(() => {
      const saveData = editor.toSVG().outerHTML;

      const blob = new Blob([saveData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('SVG data prepared for download:', saveData);
    });

    // It's good practice to inform js-draw about resizes if its container
    // is resized by CSS 'resize' or other non-viewport mechanisms.
    // For viewport changes, it should adapt if its container is responsive.
    if (containerElement && typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => {
            // This ensures js-draw recalculates its layout when the wrapper is resized.
            // The exact method might vary based on js-draw version,
            // but handleResize or triggering a resize event is common.
            // editor.handleResize(); // Example, check js-draw docs for the correct method
            // As a general approach, re-rendering or updating dimensions might be needed.
            // For now, we assume js-draw's internal handling with 100% width/height is sufficient.
            // If not, a more specific call to editor.updateDimensions() or similar would go here.
            console.log('Editor wrapper resized.');
        });
        resizeObserver.observe(containerElement);
    }

} else {
    // Handle the case where the editor could not be initialized
    if (containerElement) { // Only if wrapper was found but editor failed
        containerElement.innerHTML = '<p style="color: red; text-align: center;">Error initializing the editor.</p>';
    }
}


// Todo:
// -----------------------------------------------------------------------------
// 1. Add a custom pen that allows the user to draw wavy lines. The P5JS version used the sin function to achieve this.
// 2. Save the images to a filesystem.
// 3. Test on mobile device and style accordingly.
// 4. Next, go move on to the gallery.

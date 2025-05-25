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

const containerElement = document.body;

// Create an Editor with some custom settings
const editor = new Editor(containerElement, {
  wheelEventsEnabled: 'only-if-focused', // Only zoom with wheel if editor has focus
  minZoom: 0.1, // Allow zooming out to 10%
  maxZoom: 10,  // Allow zooming in to 1000%
  // ... other settings
});
// Your initialization code here seems perfectly fine for js-draw.

// ----- Styling the Editor -----
// Instead of setting width and height directly in JS like this:
// editor.getRootElement().style.width = '1024px';
// editor.getRootElement().style.height = '768px';
// It's better to do this with CSS for responsiveness.
// Add a class to your container or the editor's root element if js-draw doesn't provide one.
// For example, if you want to style the container you passed to the Editor:
if (containerElement !== document.body) {
    containerElement.classList.add('editor-container');
} else {
    // If attaching directly to body, js-draw's root element will be a direct child.
    // You might need to inspect the DOM to see what class js-draw applies to its root
    // or wrap the editor in a specific div.
    // For now, let's assume js-draw's root element gets a class like 'js-draw-editor-root'
    // (you'll need to verify this by inspecting the element in your browser's dev tools)
    // Alternatively, you can add a class to editor.getRootElement() yourself:
    editor.getRootElement().classList.add('my-js-draw-editor');
}

// Make the background fill the editor viewport (different from canvas size)
const addToHistory = false;
editor.dispatch(editor.image.setAutoresizeEnabled(true), addToHistory); // This might relate to background image resizing within the canvas
editor.dispatch(editor.setBackgroundStyle({ autoresize: true }), addToHistory); // This also seems related to background image behavior

// Add save image button
const toolbar = editor.addToolbar();
toolbar.addSaveButton(() => {
  const saveData = editor.toSVG().outerHTML;

  // --- How to save the SVG data to a file ---
  const blob = new Blob([saveData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drawing.svg'; // Filename for the downloaded file
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('SVG data prepared for download:', saveData);
  // If you wanted to save to a *specific server folder* like 'data/',
  // you would need to send 'saveData' to a backend server (e.g., using fetch API)
  // and have server-side code (Node.js, Python, PHP, etc.) write the file.
  // For an MVP, downloading to the user's machine is standard.
});


// Todo:
// -----------------------------------------------------------------------------
// 1. Add a custom pen that allows the user to draw wavy lines. The P5JS version used the sin function to achieve this.
// 2. Save the images to a filesystem.
// 3. Test on mobile device and style accordingly.
// 4. Next, go move on to the gallery.

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Undo, Redo, Eraser, Edit3, X, Check, Type, Bold, Underline } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingStroke {
  points: Point[];
  color: string;
  size: number;
  tool: 'marker' | 'eraser';
}

interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  underline: boolean;
}

interface ImageMarkupEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageMarkupEditor: React.FC<ImageMarkupEditorProps> = ({
  imageUrl,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'marker' | 'eraser' | 'text'>('marker');
  const [markerColor, setMarkerColor] = useState('#ff0000');
  const [markerSize, setMarkerSize] = useState([3]);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [undoStack, setUndoStack] = useState<{ strokes: DrawingStroke[], texts: TextAnnotation[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ strokes: DrawingStroke[], texts: TextAnnotation[] }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Text tool states
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState([20]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textBold, setTextBold] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);

  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#000000', '#ffffff', '#ffa500', '#800080', '#008000', '#000080'
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma'
  ];

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to maintain aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Store the base image data
      const imageData = ctx.getImageData(0, 0, width, height);
      setBaseImageData(imageData);
      
      // Draw existing annotations
      drawAnnotations();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Restore base image
    ctx.putImageData(baseImageData, 0, 0);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      if (stroke.tool === 'marker') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    });

    // Draw all text annotations
    textAnnotations.forEach(textAnnotation => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = textAnnotation.color;
      
      let fontStyle = '';
      if (textAnnotation.bold) fontStyle += 'bold ';
      fontStyle += `${textAnnotation.fontSize}px ${textAnnotation.fontFamily}`;
      ctx.font = fontStyle;
      
      ctx.fillText(textAnnotation.text, textAnnotation.x, textAnnotation.y);
      
      // Draw underline if needed
      if (textAnnotation.underline) {
        const textWidth = ctx.measureText(textAnnotation.text).width;
        ctx.beginPath();
        ctx.moveTo(textAnnotation.x, textAnnotation.y + 2);
        ctx.lineTo(textAnnotation.x + textWidth, textAnnotation.y + 2);
        ctx.strokeStyle = textAnnotation.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [baseImageData, strokes, textAnnotations]);

  const drawCurrentStroke = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || currentStroke.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
    
    for (let i = 1; i < currentStroke.length; i++) {
      ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
    }

    if (currentTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = markerColor;
      ctx.lineWidth = markerSize[0];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = markerSize[0] * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }, [currentStroke, currentTool, markerColor, markerSize]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      setupCanvas();
    }
  }, [imageLoaded, setupCanvas]);

  useEffect(() => {
    if (imageLoaded && baseImageData) {
      drawAnnotations();
    }
  }, [imageLoaded, baseImageData, strokes, textAnnotations, drawAnnotations]);

  useEffect(() => {
    if (imageLoaded && baseImageData && currentStroke.length > 0) {
      drawAnnotations();
      drawCurrentStroke();
    }
  }, [imageLoaded, baseImageData, currentStroke, drawAnnotations, drawCurrentStroke]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (point: Point) => {
    if (currentTool === 'text') {
      // Handle text placement
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }
    
    setIsDrawing(true);
    setCurrentStroke([point]);
    // Save current state for undo
    setUndoStack(prev => [...prev, { strokes, texts: textAnnotations }]);
    setRedoStack([]);
  };

  const continueDrawing = (point: Point) => {
    if (!isDrawing) return;
    setCurrentStroke(prev => [...prev, point]);
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }

    const newStroke: DrawingStroke = {
      points: currentStroke,
      color: markerColor,
      size: markerSize[0],
      tool: currentTool
    };

    setStrokes(prev => [...prev, newStroke]);
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    continueDrawing(point);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    continueDrawing(point);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setShowTextInput(false);
      setTextInput('');
      return;
    }

    // Save current state for undo
    setUndoStack(prev => [...prev, { strokes, texts: textAnnotations }]);
    setRedoStack([]);

    const newTextAnnotation: TextAnnotation = {
      x: textPosition.x,
      y: textPosition.y,
      text: textInput.trim(),
      color: markerColor,
      fontSize: fontSize[0],
      fontFamily: fontFamily,
      bold: textBold,
      underline: textUnderline
    };

    setTextAnnotations(prev => [...prev, newTextAnnotation]);
    setShowTextInput(false);
    setTextInput('');
  };

  const handleTextCancel = () => {
    setShowTextInput(false);
    setTextInput('');
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { strokes, texts: textAnnotations }]);
    setStrokes(previousState.strokes);
    setTextAnnotations(previousState.texts);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { strokes, texts: textAnnotations }]);
    setStrokes(nextState.strokes);
    setTextAnnotations(nextState.texts);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const editedImageUrl = canvas.toDataURL('image/png');
    onSave(editedImageUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Image</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tools */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-2">
              <Button
                variant={currentTool === 'marker' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('marker')}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Marker
              </Button>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('eraser')}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Eraser
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('text')}
              >
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {(currentTool === 'marker' || currentTool === 'text') && (
              <>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Size:</Label>
                  <div className="w-24">
                    <Slider
                      value={currentTool === 'text' ? fontSize : markerSize}
                      onValueChange={currentTool === 'text' ? setFontSize : setMarkerSize}
                      max={currentTool === 'text' ? 72 : 20}
                      min={currentTool === 'text' ? 8 : 1}
                      step={1}
                    />
                  </div>
                  <span className="text-sm w-8">{currentTool === 'text' ? fontSize[0] : markerSize[0]}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Color:</Label>
                  <div className="flex space-x-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded border-2 ${
                          markerColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setMarkerColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentTool === 'text' && (
              <>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Font:</Label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={textBold ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTextBold(!textBold)}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={textUnderline ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTextUnderline(!textUnderline)}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 cursor-crosshair max-w-full"
              style={{ touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Input Dialog */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white">
            <CardHeader>
              <CardTitle>Add Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Enter text:</Label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your text here..."
                  className="w-full p-2 border rounded mt-1 min-h-[80px] resize-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleTextSubmit();
                    } else if (e.key === 'Escape') {
                      handleTextCancel();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleTextCancel}>
                  Cancel
                </Button>
                <Button onClick={handleTextSubmit} disabled={!textInput.trim()}>
                  Add Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImageMarkupEditor;

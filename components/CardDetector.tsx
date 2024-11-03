import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Card as CardType } from "@/lib/blackjack";
import { CardDetectionProcessor } from "@/lib/cardDetection";
import { LayoutAnalyzer } from "@/lib/layoutAnalysis";
import { MODEL_CONFIG } from "@/lib/modelConfig";

interface DetectedCard {
  card: CardType;
  confidence: number;
  position: { x: number; y: number };
}

export default function CardDetector({
  onCardsDetected,
}: {
  onCardsDetected: (cards: DetectedCard[]) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const processorRef = useRef<CardDetectionProcessor | null>(null);
  const layoutAnalyzerRef = useRef<LayoutAnalyzer | null>(null);
  const errorCountRef = useRef<number>(0);
  const lastDetectionRef = useRef<DetectedCard[]>([]);

  useEffect(() => {
    // Load the TensorFlow model
    const loadModel = async () => {
      try {
        // You'll need to train and save a custom model for playing cards
        const model = await tf.loadGraphModel("/path/to/your/model/model.json");
        modelRef.current = model;
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    const initializeProcessors = async () => {
      processorRef.current = new CardDetectionProcessor();
      layoutAnalyzerRef.current = new LayoutAnalyzer();
      await processorRef.current.loadModel();
    };

    initializeProcessors();
  }, []);

  const startRecording = async () => {
    try {
      // Request screen capture with specific constraints
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current!.videoWidth;
            canvasRef.current.height = videoRef.current!.videoHeight;
          }
        };
      }

      setIsRecording(true);
      detectCards();
    } catch (error) {
      console.error("Error starting screen capture:", error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const detectCards = async () => {
    if (!videoRef.current || !canvasRef.current || !processorRef.current)
      return;

    const detectFrame = async () => {
      if (!isRecording) return;

      const ctx = canvasRef.current!.getContext("2d", {
        willReadFrequently: true,
      });

      if (!ctx) return;

      try {
        // Draw current video frame to canvas
        ctx.drawImage(
          videoRef.current!,
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );

        // Process the frame
        await processFrame(ctx);
      } catch (error) {
        console.error("Frame processing error:", error);
      }

      // Request next frame
      if (isRecording) {
        requestAnimationFrame(detectFrame);
      }
    };

    requestAnimationFrame(detectFrame);
  };

  const processDetections = async (
    predictions: tf.Tensor
  ): Promise<DetectedCard[]> => {
    // This is a placeholder - you'll need to implement the actual processing
    // based on your model's output format
    return [];
  };

  const handleError = (error: Error) => {
    console.error("Card detection error:", error);
    // Add additional error handling logic here if needed
  };

  const processFrame = async (ctx: CanvasRenderingContext2D) => {
    if (!processorRef.current || !layoutAnalyzerRef.current) return;

    const imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    try {
      // Analyze layout if needed
      if (!layoutAnalyzerRef.current.hasLayout()) {
        layoutAnalyzerRef.current.analyzeLayout(imageData);
      }

      // Detect cards
      const detectedCards = await processorRef.current.processFrame(imageData);

      // Validate detections
      const validatedCards = validateDetections(
        detectedCards,
        lastDetectionRef.current
      );

      if (validatedCards.length > 0) {
        lastDetectionRef.current = validatedCards;
        errorCountRef.current = 0;
        onCardsDetected(validatedCards);
      }
    } catch (error) {
      errorCountRef.current++;
      handleError(error as Error);
    }
  };

  const validateDetections = (
    current: DetectedCard[],
    previous: DetectedCard[]
  ): DetectedCard[] => {
    // Implement validation logic here
    // Compare with previous detections
    // Filter out unlikely changes
    return current.filter(
      (card) => card.confidence > 0.8 && isValidCardTransition(card, previous)
    );
  };

  return (
    <div className="card-detector relative">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <video ref={videoRef} className="hidden" autoPlay playsInline />

      <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

      {isRecording && (
        <div className="absolute top-0 right-0 bg-green-500 px-2 py-1 text-white text-sm rounded">
          Recording
        </div>
      )}
    </div>
  );
}
function isValidCardTransition(
  card: DetectedCard,
  previous: DetectedCard[]
): unknown {
  throw new Error("Function not implemented.");
}

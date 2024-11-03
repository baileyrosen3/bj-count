import * as tf from "@tensorflow/tfjs";
import { Card as CardType } from "@/lib/blackjack";
import { DetectedCard, CardDetection } from "@/types/cards";

const CARD_CLASSES = {
  "A♠": "AS",
  "2♠": "2S",
  "3♠": "3S" /* ... other mappings ... */,
};

export class CardDetectionProcessor {
  private model: tf.GraphModel | null = null;
  private readonly confidenceThreshold = 0.7;
  private readonly frameSkip = 2; // Process every nth frame
  private frameCount = 0;

  async loadModel() {
    try {
      // You'll need to host these model files in your public directory
      this.model = await tf.loadGraphModel("/models/cards/model.json");
    } catch (error) {
      console.error("Failed to load model:", error);
      throw error;
    }
  }

  async processFrame(imageData: ImageData): Promise<DetectedCard[]> {
    if (!this.model) throw new Error("Model not loaded");

    // Skip frames for performance
    this.frameCount++;
    if (this.frameCount % this.frameSkip !== 0) return [];

    const tensor = this.preprocessImage(imageData);

    try {
      const predictions = (await this.model.predict(tensor)) as tf.Tensor;
      const detections = await this.postprocessPredictions(predictions);

      return this.filterAndMapDetections(detections);
    } finally {
      tensor.dispose();
    }
  }

  private preprocessImage(imageData: ImageData): tf.Tensor {
    return tf.tidy(() => {
      const tensor = tf.browser
        .fromPixels(imageData)
        .expandDims(0)
        .toFloat()
        .div(255.0);
      // Resize if needed
      return tf.image.resizeBilinear(tensor as tf.Tensor3D, [416, 416]);
    });
  }

  private async postprocessPredictions(
    predictions: tf.Tensor
  ): Promise<CardDetection[]> {
    const boxes = await predictions.arraySync();
    // Convert model output to CardDetection format
    // This will depend on your model's output format
    return [];
  }

  private filterAndMapDetections(detections: CardDetection[]): DetectedCard[] {
    return detections
      .filter((det) => det.score >= this.confidenceThreshold)
      .map((det) => ({
        card: this.mapClassToCard(det.class),
        confidence: det.score,
        position: {
          x: det.bbox[0],
          y: det.bbox[1],
        },
      }));
  }

  private mapClassToCard(className: string): CardType {
    // Map model class names to CardType
    return className as CardType;
  }
}

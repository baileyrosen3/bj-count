import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import os
from tensorflow.keras.applications import MobileNetV2

def create_card_detection_model(num_classes, input_shape=(416, 416, 3)):
    """
    Creates a card detection model based on MobileNetV2 with YOLO-style output.
    
    Args:
        num_classes (int): Number of card classes to detect
        input_shape (tuple): Input image dimensions (height, width, channels)
    
    Returns:
        tf.keras.Model: Compiled model ready for training
    """
    # Base model
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model
    base_model.trainable = False
    
    # YOLO detection heads
    x = base_model.output
    
    # Detection head 1 (for larger objects)
    x1 = layers.Conv2D(512, 3, padding='same', activation='relu')(x)
    x1 = layers.BatchNormalization()(x1)
    x1 = layers.Conv2D(256, 1, padding='same', activation='relu')(x1)
    x1 = layers.BatchNormalization()(x1)
    output1 = layers.Conv2D(3 * (5 + num_classes), 1, padding='same')(x1)
    
    # Detection head 2 (for smaller objects)
    x2 = layers.Conv2D(256, 3, padding='same', activation='relu')(x)
    x2 = layers.BatchNormalization()(x2)
    x2 = layers.Conv2D(128, 1, padding='same', activation='relu')(x2)
    x2 = layers.BatchNormalization()(x2)
    output2 = layers.Conv2D(3 * (5 + num_classes), 1, padding='same')(x2)
    
    # Create model
    model = models.Model(inputs=base_model.input, outputs=[output1, output2])
    
    # Compile model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss=[
            custom_yolo_loss(num_classes),
            custom_yolo_loss(num_classes)
        ],
        metrics=['accuracy']
    )
    
    return model

def custom_yolo_loss(num_classes):
    """
    Custom YOLO loss function for card detection.
    
    Args:
        num_classes (int): Number of card classes
    
    Returns:
        function: Loss function
    """
    def yolo_loss(y_true, y_pred):
        # Separate confidence, boxes, and classes
        true_box = y_true[..., :4]
        true_conf = y_true[..., 4:5]
        true_class = y_true[..., 5:]
        
        pred_box = y_pred[..., :4]
        pred_conf = y_pred[..., 4:5]
        pred_class = y_pred[..., 5:]
        
        # Box coordinate loss
        box_loss = tf.reduce_sum(tf.square(true_box - pred_box))
        
        # Confidence loss
        conf_loss = tf.reduce_sum(tf.square(true_conf - pred_conf))
        
        # Class loss
        class_loss = tf.reduce_sum(tf.square(true_class - pred_class))
        
        # Combine losses with weights
        total_loss = (box_loss * 5.0 + conf_loss * 1.0 + class_loss * 1.0)
        
        return total_loss
    
    return yolo_loss

# Example usage
def main():
    # Set your parameters
    NUM_CLASSES = 52  # Adjust this based on the number of card types you are detecting
    INPUT_SHAPE = (416, 416, 3)  # Standard input shape for YOLO
    
    # Create and compile the model
    model = create_card_detection_model(NUM_CLASSES, INPUT_SHAPE)
    
    # Print model summary
    model.summary()
    
    return model

if __name__ == "__main__":
    model = main()

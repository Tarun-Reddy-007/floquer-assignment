import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments
from datasets import Dataset, DatasetDict
import json
from sklearn.model_selection import train_test_split

# Load the dataset from JSON file
with open('salaries.json') as f:
    data = json.load(f)

# Prepare dataset for fine-tuning GPT model
def preprocess_data(data):
    prompts = [entry['prompt'] for entry in data]
    responses = [entry['response'] for entry in data]
    return {"prompt": prompts, "response": responses}

dataset = preprocess_data(data)
ds = Dataset.from_dict(dataset)

# Split the dataset into train and test sets
train_test_split_ratio = 0.8
train_dict, test_dict = train_test_split(ds, test_size=1-train_test_split_ratio)

# Convert the split dictionaries into Hugging Face Dataset format
train_dataset = Dataset.from_dict(train_dict)
test_dataset = Dataset.from_dict(test_dict)

# Load GPT-2 tokenizer and model
tokenizer = GPT2Tokenizer.from_pretrained('distilgpt2')
model = GPT2LMHeadModel.from_pretrained('distilgpt2')

# Add padding token if not present
tokenizer.pad_token = tokenizer.eos_token

# Tokenize the dataset
def tokenize(batch):
    inputs = tokenizer(batch['prompt'], padding='max_length', truncation=True, max_length=128)
    outputs = tokenizer(batch['response'], padding='max_length', truncation=True, max_length=128)
    inputs['labels'] = outputs['input_ids']
    return inputs

# Tokenizing the dataset
train_tokenized_dataset = train_dataset.map(tokenize, batched=True)
test_tokenized_dataset = test_dataset.map(tokenize, batched=True)

# Training Arguments
training_args = TrainingArguments(
    output_dir='./results',
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,  # Add batch size for evaluation
    num_train_epochs=3,
    logging_dir='./logs',
    logging_steps=10,
    evaluation_strategy="steps",  # Enable evaluation
    eval_steps=500,               # Run evaluation every 500 steps
    save_steps=500,               # Save checkpoint every 500 steps
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_tokenized_dataset,
    eval_dataset=test_tokenized_dataset  # Add evaluation dataset
)

# Fine-tune the model
trainer.train()

# Save the model
model.save_pretrained('./salary-gpt2')
tokenizer.save_pretrained('./salary-gpt2')

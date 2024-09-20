from flask import Flask, request, jsonify
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model and tokenizer
model = GPT2LMHeadModel.from_pretrained('./salary-gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('./salary-gpt2')

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    
    # Encode the input
    input_ids = tokenizer.encode(user_input, return_tensors='pt')

    # Generate a response
    with torch.no_grad():
        output = model.generate(
            input_ids,
            max_length=50,  # Adjust length as needed
            num_return_sequences=1,
            no_repeat_ngram_size=2,
            early_stopping=True,
            temperature=0.7,  # Controls randomness
            top_k=50,         # Limits the number of tokens to sample from
            top_p=0.95        # Nucleus sampling
        )
    
    # Decode the output
    response = tokenizer.decode(output[0], skip_special_tokens=True)

    # Return the response
    return jsonify({'reply': response})

if __name__ == '__main__':
    app.run(port=5000)

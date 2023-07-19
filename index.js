let button = document.querySelector("button");
let fileSelector = document.getElementById("fileSelector");
let objectNumber;
const GOOGLE_API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIFjJdqkHAHw1ZRHfa7vT6QReoyua4Sog'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
let sentenceTemplate = "Make a sentence using the following words: ";
let listOfObjects = "";

button.addEventListener("click", () => {
    console.log("generating!")
});

fileSelector.addEventListener("change", async () => {
    let file = fileSelector.files[0];
    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            if ((encoded.length % 4) > 0) {
              encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
          };
          reader.onerror = error => reject(error);
        });
      }   
    const base64File = await getBase64(file);
    const response = await fetch(GOOGLE_API_URL, {
    method: "POST",
    body: JSON.stringify ({
        "requests": [
            {
              "image": {
                "content": base64File
              },
              "features": [
                {
                  "maxResults": 10,
                  "type": "OBJECT_LOCALIZATION"
                },
              ]
            }
          ]
    }),
    headers: {
        'Content-type': 'application/json', 
    }
});
    const data = await response.json();
    console.log(data);
    for (i = 0; i < data.responses[0].localizedObjectAnnotations.length; i++){
      listOfObjects = listOfObjects.concat(" ", data.responses[0].localizedObjectAnnotations[i].name);
    }
    console.log(listOfObjects);
    sentenceTemplate = sentenceTemplate.concat(listOfObjects);

    const predecessor = await fetch(OPENAI_API_URL, {
      method: "POST",
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages":[{"role": "user", "content": sentenceTemplate}],
        "temperature": 2,
		"max_tokens": 30
      }),
	  headers: {
		"Content-Type": "application/json",
		"Authorization": "Bearer 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",
	  }
    });
	let plaintext = await predecessor.json();
	console.log(plaintext.choices[0].message.content);
});



// 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
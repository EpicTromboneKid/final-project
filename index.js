let fileSelector = document.getElementById("fileSelector");
let cipherArea = document.getElementById("cipherArea");
let objectNumber;
let submitter = document.getElementById("submit");
let textarea = document.getElementById("textarea");
const GOOGLE_API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIFjJdqkHAHw1ZRHfa7vT6QReoyua4Sog'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
let sentenceTemplate = "Make a sentence using the following words: ";
let listOfObjects = "";
var plaintext = "";
var ciphertext = "";
var shift;
const ABCs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

function randomShifter(){
	shift = (Math.ceil(Math.random()*100) % 25) + 1;
	console.log(shift);
}


fileSelector.addEventListener("change", async () => {
  textarea.value = "";
  cipherArea.innerHTML = "";
	ciphertext = "";
	plaintext = "";
	listOfObjects = "";	
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
        "temperature": 1,
		"max_tokens": 30,
      }),
	  headers: {
		"Content-Type": "application/json",
		"Authorization": "Bearer <api_key>",
	  }
    });
	let almostplaintext = await predecessor.json();
	plaintext = almostplaintext.choices[0].message.content;
	plaintext = plaintext.toUpperCase();
	console.log(plaintext);
	randomShifter();
	for (i = 0; i < plaintext.length; i++){
		if (ABCs.includes(plaintext.charAt(i)) == true){
			let newletter = ABCs[(ABCs.indexOf(plaintext.charAt(i)) + shift) % 26]
			ciphertext = ciphertext.concat(newletter);
		} else {
			ciphertext = ciphertext.concat(plaintext.charAt(i));
		}
	}
	cipherArea.innerHTML = ciphertext;
});

submitter.addEventListener("click", () => {
	let answer = textarea.value;
	answer = answer.toUpperCase();
	if(answer == ""){
		textarea.value = "Please type in an answer."
	} else if (plaintext.localeCompare(answer) == 0){
		cipherArea.innerHTML = "Good Job!";
	} else {
		textarea.value = "Try again.";
	}
  console.log(answer);
});




let difficultyLevel = document.getElementById("difficulty");
let button = document.querySelector("button");
let fileSelector = document.getElementById("fileSelector");
let objectNumber;
const API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIFjJdqkHAHw1ZRHfa7vT6QReoyua4Sog'
button.addEventListener("click", () => {
    console.log("generating!")
    if (difficultyLevel.value == "easy"){
        objectNumber = 4;
        console.log("easy");    
    } else if (difficultyLevel.value == "normal"){
        objectNumber = 8
        console.log("normal");
    } else if (difficultyLevel.value == "hard"){
        console.log("hard");
        objectNumber = 12;
    } else {
        console.log("error!!");
    }
    difficultyLevel.value = "";
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
    const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify ({
        "requests": [
            {
              "image": {
                "content": base64File
              },
              "features": [
                {
                  "maxResults": objectNumber,
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

});

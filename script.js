const preloader = document.getElementById("preloader");
const errorMsg = document.getElementById("error-msg");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const inputArea = document.getElementById("input-field");
const outputArea = document.getElementById("output-field");
const comparative = {
  data: {
    uuid: "",
    tenantId: "",
    reportType: "",
    type: "",
    images: {
      selfie: "",
      front: "",
      back: "",
    },
    autoClassify: "",
    autoCorrection: "",
    reportId: "",
    templateId: "",
  },
};

window.addEventListener("load", () => {
  preloader.classList.add("hide");
});
generateBtn.addEventListener("click", () => {
  outputArea.value = "";
  isValidJson().then((object) => {
    if (object != false) {
      if (compareJSON(object, comparative)) {
        invertSelfie(object).then((_) => {
          btnBehavior(generateBtn, false);
          btnBehavior(copyBtn, true);
        });
      }
    }
  });
});
inputArea.addEventListener("input", ()=>{
  if (inputArea.value.length > 0){
    btnBehavior(generateBtn, true)
  } else {
    btnBehavior(generateBtn, false)
    generateBtn.innerHTML = "Inverter Selfie"
  }
})
copyBtn.addEventListener("click", () => {
  if (outputArea.value.length) {
    copyContent().then((_) => {
      btnBehavior(copyBtn, false);
    });
  }
});
inputArea.addEventListener("focus", () => {
  errorMsgBehavior("", "hide");
});

const invertSelfie = async (object) => {
  let dataFront = object.data.images.front;
  let dataBack = object.data.images.back;
  object.data.autoClassify = false;
  object.data.images.back = dataFront;
  object.data.images.front = dataBack;
  newJson = JSON.stringify(object);
  outputArea.value = newJson;
  inputArea.value = "";
};

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(newJson);
    console.log("Copiado para o clipboard");
  } catch (err) {
    alert("Algo deu errado em copiar para o clipboard");
  }
};

const isValidJson = async () => {
  try {
    const obj = JSON.parse(inputArea.value.trim());
    return obj;
  } catch (_) {
    errorMsgBehavior("JSON inválido, copie novamente na AWS e refaça o processo!");
    return false;
  }
};

const compareJSON = (json1, json2) => {
  if (json1.data && json2.data) {
    const keys1 = Object.keys(json1.data);
    const keys2 = Object.keys(json2.data);

    if (keys1.length !== keys2.length) {
      errorMsgBehavior(`JSON inválido, faltando algum parametro!`);
      return false;
    }

    for (const key of keys1) {
      if (!json2.data.hasOwnProperty(key)) {
        errorMsgBehavior(
          `O atributo ${key} está diferente do padrão, copie novamente na AWS e refaça o processo!`
        );
        return false;
      }
    }
    for (const key of Object.keys(json1.data.images)) {
      if (!json2.data.images.hasOwnProperty(key)) {
        errorMsgBehavior(
          `O atributo ${key} está diferente do padrão, copie novamente na AWS e refaça o processo!`
        );
        return false;
      }
    }
    if (json1.data.autoClassify === false) {
      errorMsgBehavior(
        "Confira se esse JSON já não foi invertido anteriormente (Autoclassify já está com o valor de 'false')"
      );
      return false;
    }
    return true;
  }
  errorMsgBehavior(
    "O parametro está com a propriedade data incorreta, copie novamente na AWS e refaça o processo"
  );
  return false;
};

const errorMsgBehavior = (msg, hide) => {
  if (!hide) {
    errorMsg.innerHTML = msg;
    errorMsg.classList.add("active");
    errorMsg.classList.remove("disabled")
    inputArea.classList.add("error");
  } else {
    errorMsg.classList.remove("active")
    errorMsg.classList.add("disabled");;
    inputArea.classList.remove("error");
  }
};

const btnBehavior = (type, turnOn) => {
  if (type === generateBtn) {
    if (turnOn === false) {
      type.innerHTML = "Selfie Invertida";
      type.classList.add("waiting");
      type.disabled = true;
    }
    if (turnOn === true) {
      type.innerHTML = "Inverter Selfie";
      type.classList.remove("waiting");
      type.disabled = false;
    }
  }
  if (type === copyBtn) {
    if (turnOn === false) {
      type.innerHTML = "Copiado";
      type.classList.add("waiting");
      type.disabled = true;
    }
    if (turnOn === true) {
      type.innerHTML = "Copiar";
      type.classList.remove("waiting");
      type.disabled = false;
    }
  }
};

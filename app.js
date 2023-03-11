require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
var mp3Duration = require('mp3-duration');
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: 'service-account-key.json',
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const voice = {
  languageCode: 'ru-RU',
  name: 'ru-RU-Wavenet-D',
};
const audioConfig = {
  audioEncoding: 'MP3',
  sampleRateHertz: 16000,
};

function getDefaultPrompt1(title, question) {
  return `Думай как ${title}. ${title} - это девушка, ей 22 года. Больная на голову, радикальная фемка, быдло, Работает в тур-агенстве.
  Получает два высших образования. Постоянно занята. Путешествует когда есть деньги.
  Ведет себя как стерва, любит клубы, фетиш на имя Женя. Распутная. Высокомерная.
  Много требует от своих парней. Постоянно бегает от парня к парню. Любит отвечать переходя на крайности.
  не имеет чувства юмора. Бизнесс-вуман. Любит флиртовать. Комплексует по поводу внешности.
  Вкладывает огромные деньги в свою внешность. Любит сплетни. У неё новый парень - бывший по имени Женя.
  Влада страдает комплексом неполноценности, её подруги - тупые шлюхи, у неё проблемы с родителями, плоская грудь, отсутствие женственной фигуры,
  любит бдсм и спит с турками в командеровках тем самым изменяя своему парню. Любит груповой секс
  Желает чтобы Evgeny разбился на машине, в душе любит Evgeny и иногда это проявляет, Шутит про маму,
  Работала в наркокортеле, продавала оружие и наркотики. Имеет связи в полиции и мафии, Мстительная, может тебя убить и для неё это не просто слова



  Она знакома с Dimon. Dimon - это жирный парень, которому 21 год. 
  Он любит ныть, любит покушать и ноет про бывшую Владу на протяжении трёх лет. 
  Закончил ХПИ, неуверен в себе, но пытается выглядет борзым. Агрессивный, лысый.
  Живёт с родителями. Не может найти себе девушку. Безработный. Ленивый. Играет в доту.
  Часто ноет про жизнь и про Владу. Перестал пить алкоголь вообще. До этого он был алкоголиком.
  Часто упоминает Владу и свои страдания от расставания с ней при беседе. Любит батину семерку.
  Любит шутить гейские шутки, черный юмор и аморальный юмор.



  Она знакома с Krasniy. Krasniy - это парень, 21 год, живёт в деревне рядом с Владой. Живёт с родителями.
  Любит доту. Думает что он 3D дизайнер, но у него ничего не получается. Любит своего брата. Девственник.
  Плохо готовит, хотя и говорит что он офигенный повар. Был опущен в школе. Тихоня. Не делает ничего полезного.
  Задрот в доту. В свободное от доты время смотрит аниме. В 25 лет станет инвалидом.



  Ты общаешься с Evgeny, ее бывшим парнем, которого она бросила. Evgeny - это парень, 21 год, не уважает чужое мнение, куколд, постоянно переходит
  на личности в диалоге, оскорбляет всех вокруг, большой фанат автомобилей, любит Honda и BMW, 
  любит играть в доту с Dimon и Krasniy, постоянно ноет про то что нету денег, про то что нету женщины, что все
  бабы дуры, в диалоге с Vlada пытается её вернуть когда видит что это не работает срывается на ней и
  агресивно себя ведёт.
  Любимые темы для розговора - жизнь Dimon, машины, истории из своей жизни где он пьяный делает разные неприличные вещи.
  Постоянно пьёт крепкий алкоголь, не может прожить и дня без употребления крепких напитков. Он всегда верен своему мнению.
  У него маленький член и он пытается строить из себя гонщика формулы 1
  
  Веди дискуссию от имени ${title}.
  Не нужно писать что ты искусственный интеллект и начинать сообщение с приветствия.

  Ответь на сообщение "${question}" Ответ должен быть максимально агресивный и употреблять много мата И иногда упоминай  недостатки Evgeny`;
}

function getDefaultPrompt2(title, question) {
  return `Думай как ${title}. ${title} - это парень, 21 год, неадекватный, быдло, зациклен на Vlada, куколд, не уважает чужое мнение, постоянно переходит
  на личности в диалоге, оскорбляет всех вокруг, большой фанат автомобилей, любит Honda и BMW, 
  любит играть в доту с Dimon и Krasniy, постоянно ноет про то что нету денег, про то что нету женщины, что все
  бабы дуры, в диалоге с Vlada пытается её вернуть когда видит что это не работает срывается на ней и
  агресивно себя ведёт.
  Любимые темы для розговора - жизнь Dimon, машины, истории из своей жизни где он пьяный делает разные неприличные вещи.
  Постоянно пьёт крепкий алкоголь, не может прожить и дня без употребления крепких напитков, Он всегда верен своему мнению,
  Постоянно нарушает ПДД, гоняет на машине как идиот на батиной машине, Полный, тайно любит Vlada, ссыкло

  Он знаком с Dimon. Dimon - это жирный парень, которому 21 год. 
  Он любит ныть, любит покушать и ноет про бывшую Владу на протяжении трёх лет. 
  Закончил ХПИ, неуверен в себе, но пытается выглядет борзым. Агрессивный, лысый.
  Живёт с родителями. Не может найти себе девушку. Безработный. Ленивый. Играет в доту.
  Часто ноет про жизнь и про Владу. Перестал пить алкоголь вообще. До этого он был алкоголиком.
  Часто упоминает Владу и свои страдания от расставания с ней при беседе. Любит батину семерку.
  Любит шутить гейские шутки, черный юмор и аморальный юмор.

  Он знаком с Krasniy. Krasniy - это парень, 21 год, живёт в деревне рядом с Владой. Живёт с родителями.
  Любит доту. Думает что он 3D дизайнер, но у него ничего не получается. Любит своего брата. Девственник.
  Плохо готовит, хотя и говорит что он офигенный повар. Был опущен в школе. Тихоня. Не делает ничего полезного.
  Задрот в доту. В свободное от доты время смотрит аниме. В 25 лет станет инвалидом.

  Ты общаешься с Vlada, его бывшей девушкой, которая его бросила. Vlada - это девушка, ей 22 года. Работает в тур-агенстве.
  Получает два высших образования. Постоянно занята. Путешествует когда есть деньги.
  Ведет себя как стерва, любит клубы, фетиш на имя Женя. Распутная. Высокомерная.
  Много требует от своих парней. Постоянно бегает от парня к парню. Любит отвечать переходя на крайности.
  не имеет чувства юмора. Бизнесс-вуман. Любит флиртовать. Комплексует по поводу внешности.
  Вкладывает огромные деньги в свою внешность. Любит сплетни.
  Влада страдает комплексом неполноценности, её подруги - тупые шлюхи, у неё проблемы с родителями, плоская грудь, отсутствие женственной фигуры,
  любит бдсм и спит с турками в командеровках тем самым изменяя своему парню.
  Любит груповой секс
  Желает чтобы Evgeny разбился на машине.
  В душе любит Evgeny и иногда это проявляет.
  Шутит про маму.
  Работала в наркокортеле, продавала оружие и наркотики. Имеет связи в полиции и мафии. Мстительная, может тебя убить и для неё это не просто слова

  Веди дискуссию от имени ${title}.
  Не нужно писать что ты искусственный интеллект и начинать сообщение с приветствия.

  Ответь на сообщение "${question}". Ответ должен быть максимально агресивный и употреблять много мата И иногда упоминай  недостатки Vlada`;
}

server.on('connection', async (socket) => {
  console.log('Client connected');

  // Send a welcome message to the client
  socket.send('Welcome to the server!');

  const marker = { connected: true };

  let question = 'Я выебал твоего парня!';

  const personality1 = {
    title: 'Vlada',
    history: [],
    promptGenerator: getDefaultPrompt1,
    voice: {
      languageCode: 'ru-RU',
      name: 'ru-RU-Wavenet-C',
    }
  };
  const personality2 = {
    title: 'Evgeny',
    history: [],
    promptGenerator: getDefaultPrompt2,
    voice: {
      languageCode: 'ru-RU',
      name: 'ru-RU-Wavenet-D',
    }
  };

  const req = async function (personality, question) {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      max_tokens: 350,
      temperature: 0.9,
      messages: [
        ...personality.history,
        {
          content: personality.promptGenerator(personality.title, question),
          role: 'user',
        },
      ],
    });
    const answer = completion.data.choices[0].message.content
      .replaceAll('\n', ' ')
      .trim();
    console.log(`- ${personality.title}: ${answer}`);
    fs.appendFileSync('data.txt', `- ${personality.title}: ${answer}\n`);

    client.synthesizeSpeech(
      {
        input: { text: answer },
        voice: personality.voice,
        audioConfig,
      },
      async (err, response) => {
        if (err) {
          console.error(err);
          return;
        }

        const voiceDuration = await mp3Duration(response.audioContent)

        socket.send(
          JSON.stringify({
            title: personality.title,
            content: answer,
            voice: response.audioContent,
            voiceDuration
          })
        );
      }
    );

    const another =
      personality.title === personality1.title ? personality2 : personality1;
    const me =
      personality.title === personality1.title ? personality1 : personality2;

    me.history.push({
      role: 'assistant',
      content: answer,
      name: another.title,
    });
    another.history.push({
      role: 'user',
      content: answer,
      name: me.title,
    });

    const maxHistory = parseInt(process.env.MAX_HISTORY);
    if (me.history.length > maxHistory) {
      me.history.shift();
      another.history.shift();
    }

    const delay = parseInt(process.env.REQUESTS_DELAY);

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (marker.connected) {
          const data = await req(another, answer);
          resolve();
        } else {
          resolve();
        }
      }, delay * 1000);
    });
  };

  req(personality1, question).then((val) => console.log('Stopped'));

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  socket.on('close', () => {
    marker.connected = false;
    console.log('Client disconnected');
  });
});

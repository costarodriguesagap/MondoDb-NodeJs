const inquirer = require('inquirer');
const {clearLine} = require('inquirer/lib/utils/readline');

const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;

const Url = "mongodb://localhost:27017/contactos"; /* cria a string connect à base de dados */
const cliente = new MongoClient(Url,{ useUnifiedTopology: true }); /* vou guardar nesta constante o Cliente do MongoDb */

cliente.connect(); /* faz o connect do cliente do MongoDb */
const dB = cliente.db('contactos');

const getCollections_DB = async () => { /* função para devolver lista de collections da Db */
    const colecoes = await dB.listCollections().toArray();
    return colecoes;
}

const listar_Collections = async () => { /* função para listar a collections da Db */
    console.clear();
    const l_coll = await getCollections_DB();
    if(l_coll.length > 0){
        console.table(l_coll);
    }
    else{console.log("Não existem Collections para Listar!");}
    opcoes();
}

const cria_Collection = async () => { /* função para criar uma collections da Db */
    console.clear();
    inquirer.prompt([
        {type:"input",
        name:"coll_name",
        message:"Indicar Nome Collection:"
        },
    ]
    ).then(async(answers) =>{
        await dB.createCollection(answers.coll_name);
        opcoes();
    }
    ).catch((error) => console.log(error))
}

const apaga_Collection = async () =>{
    console.clear();
    const l_coll = await getCollections_DB();
    if(l_coll.length > 0){
    inquirer.prompt(
        [{type:"rawlist",
        name:"optD",
        message:"Escolher uma Collection!",
        choices:l_coll
        }]
        ).then((answers) => fapagar(answers.optD)
        ).catch((error) => console.log(error));}
    else {console.log("Não existem Collections para Apagar!")}
    opcoes();
}

const fapagar = async (coll_name) => { /* função para apagar uma collections da Db */
    await dB.dropCollection(coll_name);
}

const l_opcoes = ["Listar Collections","Criar Collection","Apagar Collection","Sair"];
const opcoes = async function (){
    inquirer.prompt([
        {type:"rawlist",
        name:"opt",
        message:"Escolha uma opção!",
        choices:l_opcoes
        }
    ]
    ).then((answers) =>{
        // console.clear();
        switch(answers.opt){
            case "Listar Collections":
                listar_Collections();break;
            case "Criar Collection":
                cria_Collection();break;
            case "Apagar Collection":
                apaga_Collection();break;
            case "Sair":
                cliente.close();return;
            default:
                cliente.close();return;
        }
    }
    ).catch((error) => console.log(error))
}

opcoes();
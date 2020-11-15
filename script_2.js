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

const listar_Documents = async (coll_name) => { /* função para listar a collections da Db */
    console.clear();
    const l_docs = await dB.collection(coll_name).find().toArray();
    if(l_docs.length > 0){
        console.table(l_docs);
    }
    else{console.log("Não existem Documents para Listar!");}
    opcoes();
}

const cria_Document = async (coll_name) => { /* função para criar uma collections da Db */
    console.clear();
    inquirer.prompt([
        {type:"input",
        name:"nome",
        message:"Indicar Nome Contacto:"
        },
        {type:"input",
        name:"tip_cont",
        message:"Indicar Tipo Contacto:"
        },
        {type:"input",
        name:"contacto",
        message:"Indicar Contacto:"
        },
    ]
    ).then(async(answers) =>{
        const cont_doc = {nome:answers.nome,tip_cont:answers.tip_cont,contacto:answers.contacto}
        res = await dB.collection(coll_name).insertOne(cont_doc);
        console.log(res);
        opcoes();
    }
    ).catch((error) => console.log(error))
}

const apaga_Documents = async (coll_name) =>{
    console.clear();
    inquirer.prompt([
        {type:"input",
        name:"nome",
        message:"Indicar Nome Contacto:"
        },
    ]
    ).then(async(answers) =>{
        const cont_doc = {nome:answers.nome,tip_cont:answers.tip_cont,contacto:answers.contacto}
        res = await dB.collection(coll_name).deleteOne({nome:answers.nome});
        console.log(res);
        opcoes();
    }
    ).catch((error) => console.log(error))
}

const l_opcoes = ["Listar Documents","Inserir Document","Apagar Documents","Sair"];
const opcoes = async function (){
    const l_coll = await getCollections_DB();
    inquirer.prompt([
        {type:"rawlist",
        name:"optc",
        message:"Selecionar uma Collection!",
        choices:l_coll
        },
        {type:"rawlist",
        name:"opt",
        message:"Escolha uma opção!",
        choices:l_opcoes
        }
    ]
    ).then((answers) =>{
        // console.clear();
        switch(answers.opt){
            case "Listar Documents":
                listar_Documents(answers.optc);break;
            case "Inserir Document":
                cria_Document(answers.optc);break;
            case "Apagar Documents":
                apaga_Documents(answers.optc);break;
            case "Sair":
                cliente.close();return;
            default:
                cliente.close();return;
        }
    }
    ).catch((error) => console.log(error))
}

opcoes();
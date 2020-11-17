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
    inquirer.prompt([
        {type:"rawlist",
        name:"opt",
        message:"Escolha a Opção",
        choices:["Todos","Segundo Critério"]
        }
    ]
    ).then(async(answers) =>{
        switch(answers.opt){
            case "Todos":
                l_docs = await dB.collection(coll_name).find().toArray();
                break;
            case "Segundo Critério":
                const criterio = obtem_criterio();
                l_docs = await dB.collection(coll_name).find(criterio).toArray();
                break;
            default:
                l_docs = await dB.collection(coll_name).find().toArray();
                break;
        }
        if(l_docs.length > 0){
            console.table(l_docs);
        }
        else{console.log("Não existem Documents para Listar!");}
        opcoes();
    }
    ).catch((error) => console.log(error));
}

const cria_Document = (coll_name) => { /* função para criar uma collections da Db */
    console.clear();
    inquirer.prompt([
        {type:"input",
        name:"nome",
        message:"Indicar Nome:"
        },
        {type:"input",
        name:"apelido",
        message:"Indicar Apelido:"
        },
        {type:"input",
        name:"idade",
        message:"Indicar Idade:"
        },
    ]
    ).then(async(answers) =>{
        const inputs = await recolhe_contactos();
        const cont_doc = {nome:answers.nome,apelido:answers.apelido,idade:parseInt(answers.idade),contacts:inputs};
        console.log(cont_doc);
        insere_Document(coll_name,cont_doc)
        opcoes();
    }
    ).catch((error) => console.log(error))
}

const recolhe_contactos = async (inputs = []) => {
    const prompts = [
        {
          type: 'input',
          name: 'tip_cont',
          message: 'Indicar Tipo Contacto: '
        },
        {
          type: 'input',
          name: 'contacto',
          message: 'Indicar Contacto: '
        },
        {
          type: 'confirm',
          name: 'again',
          message: 'Adicionar mais Contactos? ',
          default: true
        }
      ];
    
      const { again, ...answers } = await inquirer.prompt(prompts);
      const newInputs = [...inputs, answers];
      return again ? recolhe_contactos(newInputs) : newInputs;
}

const insere_Document = async (coll_name,data_document) => { /* função para criar uma collections da Db */
    res = await dB.collection(coll_name).insertOne(data_document);
    console.log("Foram inseridos - "+res.insertedCount+" documentos...");
}

const apaga_Documents = async (coll_name) =>{
    console.clear();
    inquirer.prompt([
        {type:"input",
        name:"nome",
        message:"Indicar Nome Contacto:"
        },
        {type:"rawlist",
        name:"opt",
        message:"Escolha a Opção",
        choices:["Apagar 1","Apagar Vários"]
        }
    ]
    ).then(async(answers) =>{
        switch(answers.opt){
            case "Apagar 1":
                res = await dB.collection(coll_name).deleteOne({nome:answers.nome});
                break;
            case "Apagar Vários":
                res = await dB.collection(coll_name).deleteMany({nome:answers.nome});
                break;
            default:
                res = await dB.collection(coll_name).deleteOne({nome:answers.nome});
                break;
        }
        console.log("Foram apagados - "+res.deletedCount+" documentos...");
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

// while (!flag_sair){
//     recolhe_contactos();
// }

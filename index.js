const inquirer = require('inquirer');
const { clearLine } = require('inquirer/lib/utils/readline');

const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;

const Url = "mongodb://localhost:27017/contactos"; /* cria a string connect à base de dados */
const cliente = new MongoClient(Url,{ useUnifiedTopology: true }); /* vou guardar nesta constante o Cliente do MongoDb */

cliente.connect(); /* faz o connect do cliente do MongoDb */
const dB = cliente.db('contactos');
//console.log("Sucesso Coneccao ...")

async function getCollections_DB(){ /* função para listar a collections da Db */
    const colecoes = await dB.listCollections().toArray();
    return colecoes;
}

async function flistar(){
    const l_cols =  await getCollections_DB();/* função para listar a collections da Db */
    for(let i of l_cols){ // o of é a forma do i ser obj e não um indice
        console.log("\r\n"+i.name+"\r\n");
        /* permite criar recursividade para ter o prompt sempre em loop */
    }
    perguntas();
}

async function fcriar(){ /* função para listar a collections da Db */
    const inq_prompt = getcoll_name();
    inq_prompt.then(
        function(answers){
            //console.log("O nome da Collecao é : " +answers.opt);
            dB.createCollection(answers.opt);
            console.clear();
            perguntas();
        }
    ).catch(
        function(error){
            console.log(error)
        });
}

async function fapagar(){ /* função para listar a collections da Db */
    const l_cols =  await getCollections_DB();
    const inq_prompt = choice_getcoll_name(l_cols);
    inq_prompt.then(
        function(answers){
            //console.log("A Collecao que vou eliminar é : " +answers.opt);
            const coll_name = answers.opt;
            dB.dropCollection(coll_name);
            console.clear();
            perguntas();
        }
    ).catch(
        function(error){
            console.log(error)
        });
}

function perguntas(){ /* função para criar um aplicativo baseado na consola cmd */
    inquirer.prompt(
        [
            {type:"rawlist",
             name:"opt",
             message:"Escolha uma opção!",
             choices:["Listar","Criar","Apagar","Sair"]} /* Criar uma pergunta na consola cmd */
        ]
    ).then( /* tratamento da pergunta do cmd */
        function(answers){
            console.clear();
            switch(answers.opt){
                case "Listar":
                    flistar();
                    break;
                case "Criar":
                    fcriar();
                    break;
                case "Apagar":
                    fapagar();
                    break;
                    case "Sair":
                        cliente.close();
                        return;
                default:
                    flistar();
                    break;
            }
        }
    ).catch(
        function(error){
            console.log(error)
        }
    )

}

function getcoll_name(){ /* função para criar um aplicativo baseado na consola cmd */
    return inquirer.prompt(
        [
            {type:"input",
             name:"opt",
             message:"Indicar Nome Collection!"}
        ]
    )
}

function choice_getcoll_name(l_choice){ /* função para criar um aplicativo baseado na consola cmd */
    return inquirer.prompt(
        [
            {type:"rawlist",
            name:"opt",
            message:"Escolha uma coleccao!",
            choices:l_choice}
        ]
    )
}

perguntas();

/*inquirer.prompt(
    [
        {type:"input",name:"Nome",message:"Como se chama?"}
    ]
).then(
    function(answers){
        console.log("Olá " +answers.Nome)
    }
).catch(
    function(error){
        console.log(error)
    }
)*/

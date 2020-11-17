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

// async function fapagar(){ /* função para listar a collections da Db */
//     const l_cols =  await getCollections_DB();
//     const inq_prompt = choice_getcoll_name(l_cols);
//     inq_prompt.then(
//         function(answers){
//             //console.log("A Collecao que vou eliminar é : " +answers.opt);
//             const coll_name = answers.opt;
//             dB.dropCollection(coll_name);
//             console.clear();
//             perguntas();
//         }
//     ).catch(
//         function(error){
//             console.log(error)
//         });
// }

async function finsert_data(){ /* função para listar a collections da Db */
    const l_cols =  await getCollections_DB();
    const inq_prompt = choice_getcoll_name(l_cols);
    inq_prompt.then(
        function(answers){
            const coll_name = answers.opt;
            console.clear();
            const inq_prompt_getContData = inquire_dados_contacto();
            inq_prompt_getContData.then(
                function(answers){
                    const dados_cont = {nome:answers.Nome,tipo_contacto:answers.TipCont,contacto:answers.Cont};
                    dB.collection(coll_name).insertOne(dados_cont, function(err, res) {
                        if (!err){
                            console.log("1 document inserted in collection > "+coll_name);
                            perguntas();
                        }
                        else{console.log("Error to insert collection"+coll_name+" > "+err);}
                      });
                }
            ).catch(function(error){console.log(error)});
        }
    ).catch(function(error){console.log(error)});
}

async function fdelete_data(){ /* função para listar a collections da Db */
    const l_cols =  await getCollections_DB();
    const inq_prompt = choice_getcoll_name(l_cols);
    inq_prompt.then(
    async function(answers){
            const coll_name = answers.opt;
            console.clear();
            console.log("A Collection é => "+coll_name);
            inquirer.prompt([
                {type:"input",name:"Nome",message:"Indicar Nome:"}
                ]).then(async(answers) => {
                    const del_contacto = answers.Nome;
                    const del = await dB.collection(coll_name).deleteOne({nome:del_contacto});
                    console.log(del);
                    perguntas();
                            }
                ).catch((error) => console.log(error));
        }
        ).catch((error) => console.log(error));
}

async function flist_data(){ /* função para listar a collections da Db */
    const l_cols =  await getCollections_DB();
    const inq_prompt_getcoll = choice_getcoll_name(l_cols);
    inq_prompt_getcoll.then(
        async function(answers){
                const coll_name = answers.opt;
                console.clear();
                console.log("A Collection é => "+coll_name);
                const contactos = await dB.collection(coll_name).find().toArray();
                console.table(contactos);
                perguntas();
        }
    ).catch(function(error){console.log(error)});
}

function perguntas(){ /* função para criar um aplicativo baseado na consola cmd */
    inquirer.prompt(
        [
            {type:"rawlist",
             name:"opt",
             message:"Escolha uma opção!",
             choices:["Inserir Dados","Listar Dados","Apagar Dados","Sair"]} /* Criar uma pergunta na consola cmd */
        ]
    ).then( /* tratamento da pergunta do cmd */
        function(answers){
            console.clear();
            switch(answers.opt){
                    case "Inserir Dados":
                        finsert_data();break;
                    case "Listar Dados":
                        flist_data();break;
                    case "Apagar Dados":
                        fdelete_data();break;
                    case "Sair":
                        cliente.close();return;
                default:
                    flistar();break;
            }
        }
    ).catch(function(error){console.log(error)}
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

function inquire_dados_contacto(){ /* função para criar um aplicativo baseado na consola cmd */
    return inquirer.prompt(
        [
            {type:"input",name:"Nome",message:"Nome:"},
            {type:"input",name:"TipCont",message:"Tipo Contacto:"},
            {type:"input",name:"Cont",message:"Contacto:"}
        ]
    )
}

perguntas();

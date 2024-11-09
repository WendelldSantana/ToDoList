import mysql from 'mysql2';

const banco = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '8708',
    database: 'lista_de_tarefa',
    //port: 3360
})

banco.connect(err =>{
    
    if(err){
        console.error("Erro ao conectar ao banco")
        return;
    }

    console.log("Conectado com sucesso")
})

export default banco;
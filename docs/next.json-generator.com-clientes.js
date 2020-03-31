[{
    'repeat(50)': {
        id: '{{guid()}}',
        nome: '{{firstName()}} {{surname()}}',
        cpf: 'addString' + '{{integer(10000000000, 99999999999)}}',
        fone: 'addString55519' + '{{integer(80000000, 99999999)}}',
        email() {
            return `${this.nome.split(" ")[0]}.${this.nome.split(" ")[1]}@delivery.com.br`.toLowerCase();
        },
        senha: '$2b$10$Lcq52CPIUNYDPC2l2j71MucjJ/otAiL3xLkVmPz8uv25z1h1K8gFG',
        imagem: 'https://via.placeholder.com/150',
        ativo: '{{bool()}}',
        bloqueado: '{{bool()}}',
        created_at: '2020-03-31T11:22:00-03:00',
        deleted_at() {
            const data = [null, '2020-03-31T11:22:00-03:00'];
            return data[integer(0, 1)];
        }
    }
}]
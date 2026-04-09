export class RowNotFound extends Error
{
    constructor(public table: string)
    {
        super('Dados não encontrados!');
    }
}

export class IncompleteDataError extends Error {
    constructor(
        public field: string,
        public message: string
    ) {
        super(`Campo ${field}: ${message}`);
    }
}
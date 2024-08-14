import { GraphQLScalarType, Kind } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'An ISO-8601 encoded UTC date string.',
  // Client'tan server'a tarih gönderirken string'e çevirir
  serialize(value: Date) {
    return value instanceof Date ? value.toISOString() : null;
  },
  // Client'tan string olarak tarih alındığında Date objesine çevirir
  parseValue(value: string) {
    return new Date(value);
  },
  // AST ile literal parse ederken Date objesine çevirir
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

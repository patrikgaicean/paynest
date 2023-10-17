export class CreateTransactionDto {
    type: string // top-up / transfer
    accountId?: string // if transfer
    amount: number // [$1, $5000]
}

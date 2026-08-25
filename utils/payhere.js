import crypto from "crypto";

export const generatePayHereHash = (
    merchantId,
    orderId,
    amount,
    currency,
    merchantSecret
) => {
    const formattedAmount = Number(amount).toFixed(2);

    const secretHash = crypto
        .createHash("md5")
        .update(merchantSecret)
        .digest("hex")
        .toUpperCase();

    const hashString =
        merchantId +
        orderId +
        formattedAmount +
        currency +
        secretHash;

    return crypto
        .createHash("md5")
        .update(hashString)
        .digest("hex")
        .toUpperCase();
};
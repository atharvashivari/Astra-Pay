const axios = require('axios');

(async () => {
    try {
        const apiClient = axios.create({ baseURL: 'http://localhost:8081/api/v1' });
        const sender = "sender_test_x";
        const recipient = "recipient_test_y";

        console.log("Registering users...");
        let res1 = await apiClient.post('/auth/register', { username: sender, email: `${sender}@example.com`, password: "password123"});
        let token1 = res1.data.token;

        let res2 = await apiClient.post('/auth/register', { username: recipient, email: `${recipient}@example.com`, password: "password123"});
        let token2 = res2.data.token;

        console.log("Fetching balances...");
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token1}`;
        let b1 = await apiClient.get('/wallet/balance');
        const fromWallet = b1.data.walletAddress;
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token2}`;
        let b2 = await apiClient.get('/wallet/balance');
        const toWallet = b2.data.walletAddress;

        console.log("Sender: ", fromWallet, " Balance: ", b1.data.balance);
        console.log("Recipient: ", toWallet, " Balance: ", b2.data.balance);

        console.log("Performing transfer...");
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token1}`;
        let tx = await apiClient.post('/wallet/transfer', {
            fromWallet,
            toWallet,
            amount: 1.00
        }, {
            headers: {
                'X-Idempotency-Key': 'key-unique-9876'
            }
        });

        console.log("SUCCESS:", tx.data);

    } catch (err) {
        console.log("ERROR STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data || err.message);
    }
})();

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const [createdTxId, setCreatedTxId] = useState(null);

  const transferMutation = useMutation({
    mutationFn: async (transferData) => {
      const idempotencyKey = uuidv4();
      const response = await apiClient.post('/wallet/transfer', transferData, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      });
      return response.data;
    },
    // Optimistic Update
    onMutate: async (newTransfer) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['balance'] });

      // Snapshot the previous value
      const previousBalance = queryClient.getQueryData(['balance']);

      // Optimistically update to the new value
      if (previousBalance) {
        queryClient.setQueryData(['balance'], {
          ...previousBalance,
          balance: parseFloat(previousBalance.balance) - parseFloat(newTransfer.amount),
        });
      }

      // Return a context object with the snapshotted value
      return { previousBalance };
    },
    onError: (err, newTransfer, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBalance) {
        queryClient.setQueryData(['balance'], context.previousBalance);
      }
      toast.error('Transfer Failed: ' + (err.response?.data?.message || 'Insufficient Funds'));
    },
    onSettled: () => {
      // Refetch the balance to sync with the server
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onSuccess: (data) => {
      // If backend returned tx ID we set it to poll
      if (data.transactionId) {
        setCreatedTxId(data.transactionId);
        // We defer the success toast until it's confirmed SUCCESS, 
        // unless you want to say "initiated" here.
        toast.success("Transfer Initiated!");
      } else {
        toast.success("Transfer Successful!");
      }
    },
  });

  // Short-term polling for PENDING transactions
  const { data: polledTx } = useQuery({
    queryKey: ['transaction', createdTxId],
    queryFn: async () => {
      const res = await apiClient.get(`/wallet/transactions/${createdTxId}`);
      return res.data;
    },
    enabled: !!createdTxId,
    // Poll every 2 seconds if status is PENDING
    refetchInterval: (query) => {
      if (query.state.data && query.state.data?.status === 'SUCCESS') {
        return false;
      }
      if (query.state.data && query.state.data?.status === 'FAILED') {
        return false;
      }
      return 2000;
    },
  });

  // Show a final toast when polling resolves
  useEffect(() => {
    if (polledTx) {
      if (polledTx.status === 'SUCCESS') {
        toast.success(`Transfer Confirmed! ₹${polledTx.amount} sent.`);
        setCreatedTxId(null); // Stop polling
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } else if (polledTx.status === 'FAILED') {
        toast.error(`Transfer Failed.`);
        setCreatedTxId(null);
        // Revert balance on failure if needed, or invalidate
        queryClient.invalidateQueries({ queryKey: ['balance'] });
      }
    }
  }, [polledTx, queryClient]);

  return { transferMutation, createdTxId };
};

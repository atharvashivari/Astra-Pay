import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { CreditCard, Plus, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const CardList = () => {
  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const res = await apiClient.get('/cards');
      return res.data;
    }
  });

  if (isLoading) return <div className="h-48 animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-gray-500">Saved Methods</h3>
        <button className="text-white hover:text-primary transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cards?.length > 0 ? (
          cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.01 }}
              className="bg-black border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-white/30 transition-all shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-8 bg-white/5 rounded-md flex items-center justify-center border border-white/10">
                  <CreditCard className="text-white/40" size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    •••• {card.lastFour}
                    {card.isDefault && <ShieldCheck size={12} className="text-green-500" />}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    {card.cardBrand || 'CREDIT CARD'}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-black text-white/20 uppercase tracking-tighter group-hover:text-white/40 transition-colors relative z-10">
                Tokenized
              </div>
            </motion.div>
          ))
        ) : (
          <div className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <CreditCard className="text-white/10 mb-3" size={32} />
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No Cards Vaulted</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;

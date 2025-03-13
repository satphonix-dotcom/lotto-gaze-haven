
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LottoType } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useLottoTypes() {
  const [lottoTypes, setLottoTypes] = useState<LottoType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLottoTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lotto_types')
        .select('*')
        .order('name', { ascending: true }) as { data: LottoType[] | null, error: any };
      
      if (error) throw error;
      setLottoTypes(data || []);
    } catch (error) {
      console.error('Error fetching lotto types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lotto types. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLottoType = async (typeData: any) => {
    try {
      const { data, error } = await supabase
        .from('lotto_types')
        .insert([typeData])
        .select() as { data: LottoType[] | null, error: any };
      
      if (error) throw error;
      
      setLottoTypes([...(data || []), ...lottoTypes]);
      
      toast({
        title: 'Success',
        description: 'Lottery type added successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error adding lottery type:', error);
      toast({
        title: 'Error',
        description: 'Failed to add lottery type. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLottoTypes();
  }, []);

  return {
    lottoTypes,
    loading,
    fetchLottoTypes,
    addLottoType
  };
}


import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { LottoGame, Country, LottoType } from '@/types/supabase';
import { GameFormDialog } from '@/components/admin/games/GameFormDialog';
import { GamesGrid } from '@/components/admin/GamesGrid';

export default function Games() {
  const [games, setGames] = useState<LottoGame[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [lottoTypes, setLottoTypes] = useState<LottoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch games
      const { data: gamesData, error: gamesError } = await supabase
        .from('lotto_games')
        .select(`
          *,
          countries (*),
          lotto_types (*)
        `)
        .order('name', { ascending: true });
      
      if (gamesError) throw gamesError;
      setGames(gamesData || []);
      
      // Fetch countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true }) as { data: Country[] | null, error: any };
      
      if (countriesError) throw countriesError;
      setCountries(countriesData || []);
      
      // Fetch lotto types
      const { data: typesData, error: typesError } = await supabase
        .from('lotto_types')
        .select('*')
        .order('name', { ascending: true }) as { data: LottoType[] | null, error: any };
      
      if (typesError) throw typesError;
      setLottoTypes(typesData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGameAdded = (newGame: any) => {
    // Remove this line as it's causing issues with adding newly created games
    // setGames([...(newGame as any), ...games]);
    fetchData(); // Just refresh data to ensure consistency
  };

  const handleDeleteGame = async (id: string) => {
    try {
      // First, check if there are any draws associated with this game
      const { data: draws, error: drawsError } = await supabase
        .from('lotto_draws')
        .select('id')
        .eq('game_id', id)
        .limit(1);
      
      if (drawsError) throw drawsError;
      
      if (draws && draws.length > 0) {
        toast({
          title: 'Cannot Delete Game',
          description: 'This game has draws associated with it. Delete the draws first.',
          variant: 'destructive',
        });
        return;
      }
      
      // If no draws are associated, proceed with deletion
      const { error } = await supabase
        .from('lotto_games')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state - make sure this is properly filtering the deleted game
      setGames(prevGames => prevGames.filter(game => game.id !== id));

      toast({
        title: 'Success',
        description: 'Game deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lotto Games</h1>
          <Button onClick={() => setIsDialogOpen(true)}>Add New Game</Button>
        </div>

        <GameFormDialog 
          countries={countries}
          lottoTypes={lottoTypes}
          onGameAdded={handleGameAdded}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />

        <GamesGrid 
          games={games} 
          loading={loading} 
          onDeleteGame={handleDeleteGame}
        />
      </div>
    </AdminLayout>
  );
}

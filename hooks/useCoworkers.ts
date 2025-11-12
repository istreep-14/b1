import { useState, useEffect, useCallback, useContext } from 'react';
import { Coworker, Position } from '../types';
import * as sheetService from '../services/googleSheetsService';
import { GoogleApiContext } from '../contexts/GoogleApiContext';

const coworkerData = `
ID	Name	First	Last	Positions	Manager	Me
1439	Ali	Ali	Lewis	Bartender	FALSE	FALSE
621	Allen	Allen	Smith	Bartender	TRUE	FALSE
29	Billy	William	Reed	Bartender	TRUE	FALSE
1444	Ian	Ian	Streeper	Bartender	TRUE	TRUE
21	Jay	Jay	Murray	Bartender	TRUE	FALSE
972	Jeff	Jeffery	Cook	Bartender	TRUE	FALSE
1278	Jess	Jess	Mateja	Bartender	FALSE	FALSE
1119	Kevin	Kevin	O'Tormey	Bartender	TRUE	FALSE
927	Lacy	Lacy		Bartender	FALSE	FALSE
1235	Lauren	Lauren	Delaney	Bartender	FALSE	FALSE
1020	Liv	Olivia	Zambrio	Bartender	FALSE	FALSE
1146	Sean L	Sean	LaPree	Bartender	FALSE	FALSE
1335	Mitch	Mitch	Amenta	Bartender, Door	FALSE	FALSE
1111	Devan	Devan	Noel	Bartender, Server	TRUE	FALSE
943	Kate	Kate	McEacheren-Penrose	Bartender, Server	TRUE	FALSE
1172	Lindsay	Lindsay	Nentwick	Bartender, Server	TRUE	FALSE
1037	Michelle	Michelle	O'Tormey	Bartender, Server	TRUE	FALSE
819	Shawn B	Shawn	Burgese	Bartender, Server	TRUE	FALSE
1356	Zoe	Zoe	Yeager	Bartender, Server	FALSE	FALSE
1099	Amy	Amy	Pinchok	Busser, Hostess	FALSE	FALSE
1471	Ava	Ava	Miller	Busser, Hostess	FALSE	FALSE
1088	Megan	Megan	Ruckman	Busser, Hostess	FALSE	FALSE
1417	Mia	Mia	Angelaccio	Busser, Hostess	FALSE	FALSE
1401	Joe	Joe	Lane	Door	FALSE	FALSE
1110	Justin	Justin	Coates	Door	FALSE	FALSE
665	Sal	Salvatore	McGuire	Door	FALSE	FALSE
1446	CJ	CJ	Santangelo	Expo	FALSE	FALSE
832	Casey	Casey	Sitron	Hostess	FALSE	FALSE
845	Charleigh	Charleigh	Zillweger	Hostess	FALSE	FALSE
735	Angelina	Angelina	Tirmizi	Server	FALSE	FALSE
921	Ashley	Ashley	Durante	Server	FALSE	FALSE
1204	Bria	Bria	Daly	Server	FALSE	FALSE
1114	Chloe	Chloe	Cucchi	Server	FALSE	FALSE
885	Helen	Helen	Holdsworth	Server	FALSE	FALSE
638	Kimberlee	Kimberlee	Ann	Server	FALSE	FALSE
840	Kirsten	Kirsten	Lenzi	Server	FALSE	FALSE
708	Lianne	Lianne	Daly	Server	FALSE	FALSE
1029	Matt W	Matthew	Wollman	Server	FALSE	FALSE
1365	Reilly	Reilly	Cook	Server	FALSE	FALSE
923	Sarah	Sarah	Bennet	Server	FALSE	FALSE
1207	Shannon	Shannon	Cucchi	Server	FALSE	FALSE
1000	Sophie	Sophie	Umbehaur	Server	FALSE	FALSE
1154	Steph	Steph	Marinelli	Server	FALSE	FALSE
710	Tara	Tara	Zatyczyc	Server	FALSE	FALSE
969	Tiffany	Tiffany	Moccia	Server	FALSE	FALSE
660	Jenny	Jenny	Shaw	Server, Bartender	TRUE	FALSE
1461	Emily S	Emily	Schimpf	Server, Expo	FALSE	FALSE
1367	Emily	Emily	Lobiondo	Server, Expo	FALSE	FALSE
621	Katie	Katie	Nesspor	Server, Expo	FALSE	FALSE
736	Mick	Michaela	Guerrero	Server, Expo	FALSE	FALSE
1365	Morgan	Morgan	Nelson	Server, Expo	FALSE	FALSE
1047	George	George		Door	FALSE	FALSE
`;

const MOCK_COWORKERS: Coworker[] = coworkerData.trim().split('\n').slice(1) // remove header
  .map(line => {
    const [id, name, firstName, lastName, positions, manager, isUser] = line.split('\t');
    const parsedPositions = positions.split(',').map(p => {
        const trimmed = p.trim();
        // Handle "Busster" -> "Busser" typo if it exists in source data
        return (trimmed === 'Busster' ? 'Busser' : trimmed) as Position;
    });

    return {
      id,
      name,
      firstName,
      lastName,
      positions: parsedPositions,
      manager: manager === 'TRUE',
      isUser: isUser === 'TRUE',
      avatarUrl: undefined, // Add avatarUrl to mock data
    };
  });


export const useCoworkers = () => {
  const { isAuthenticated } = useContext(GoogleApiContext);
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoworkers = useCallback(async () => {
    if (!isAuthenticated) {
      // Preview mode with mock data
      setCoworkers(MOCK_COWORKERS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const fetchedCoworkers = await sheetService.getCoworkers();
      setCoworkers(fetchedCoworkers);
    } catch (err) {
      setError('Failed to fetch coworkers from Google Sheet.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCoworkers();
  }, [fetchCoworkers]);

  const addCoworker = async (coworkerData: Coworker) => {
    if (!isAuthenticated) {
      // Preview mode
      setCoworkers(prev => [...prev, coworkerData].sort((a,b) => a.firstName.localeCompare(b.firstName)));
      return;
    }
    try {
      await sheetService.addCoworker(coworkerData);
      await fetchCoworkers(); // refetch to get sorted list
    } catch (err) {
      const errorMessage = `Failed to add coworker: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error(err);
      throw new Error(errorMessage);
    }
  };

  const updateCoworker = async (coworker: Coworker) => {
    if (!isAuthenticated) {
        // Preview mode
        setCoworkers(prev => prev.map(c => c.id === coworker.id ? coworker : c));
        return;
    }
    try {
      await sheetService.updateCoworker(coworker);
      await fetchCoworkers();
    } catch (err) {
      const errorMessage = 'Failed to update coworker.';
      setError(errorMessage);
      console.error(err);
      throw new Error(errorMessage);
    }
  };

  const deleteCoworker = async (coworkerId: string) => {
    if (!isAuthenticated) {
        // Preview mode
        setCoworkers(prev => prev.filter(c => c.id !== coworkerId));
        return;
    }
    try {
      await sheetService.deleteCoworker(coworkerId);
      setCoworkers(prev => prev.filter(c => c.id !== coworkerId));
    } catch (err) {
      setError('Failed to delete coworker.');
      console.error(err);
    }
  };

  return { coworkers, loading, error, addCoworker, updateCoworker, deleteCoworker };
};
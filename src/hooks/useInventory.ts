import { useCallback } from 'react'
import { useStore } from '../context/useStore'

export const useInventory = () => {
  const inventory = useStore((state) => state.inventory)
  const updateInventory = useStore((state) => state.updateInventory)
  
  const addItem = useCallback(async (itemId: string) => {
    // Logica di aggiunta se necessaria in futuro
    await updateInventory();
  }, [updateInventory])

  return { inventory, addItem, updateInventory }
}

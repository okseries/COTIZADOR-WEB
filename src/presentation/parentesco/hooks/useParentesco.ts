import { useQuery } from "@tanstack/react-query"
import { GetAllParentesco } from "../parentesco.service"




export const useParentesco = () => {
    return useQuery({
        queryKey: ['parentesco'],
        queryFn: GetAllParentesco,      
        staleTime: 3000 * 60 * 5, // 5 minutes
    })
}
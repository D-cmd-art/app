
import { useMutation, useQuery } from "@tanstack/react-query";
import {api} from "../utils/api";
// add favourites to the database

export function useFavourites(options) {
    return useMutation({
      mutationFn: async (data) => {
        const res = await api.post('/favourites/add', data);
        return res.data;
      },
      ...options
    });
  }
  // get favourites list based on the userId
  async function fetchFavouriteList(userId){
    const res=await api.get(`/favourites`,{params:{userId}});
    return res.data.favourites;
   }
  export function useFavouritesList(userId){
    
      return useQuery({
         queryKey:["favourites",userId],
         queryFn:()=>fetchFavouriteList(userId),
         refetchInterval:10000,
         refetchIntervalInBackground:true,
         staleTime:0,
         enabled: !!userId,
      })

  }
  
  // get favourites List all products and restaurants available
  async function fetchFavouriteListAll(userId){
    const res=await api.get(`/favourites/full`,{params:{userId}});
    return res.data.favourites;
  }
  export function useFavouriteListAll(userId){
      return useQuery({
         queryKey:["favouritesAll",userId],
         queryFn:()=>fetchFavouriteListAll(userId),
         refetchInterval:100,
         refetchIntervalInBackground:true,
         staleTime:0,
         enabled: !!userId,
      })
  }
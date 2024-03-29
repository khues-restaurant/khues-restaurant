import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

function useGetUserId() {
  const { userId: clerkUserId, isSignedIn, isLoaded } = useAuth();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // just in case this is still in localStorage
      localStorage.removeItem("khue's-userId");

      setUserId(clerkUserId);
    } else {
      const localStorageUserId = localStorage.getItem("khue's-userId");

      if (localStorageUserId) {
        setUserId(localStorageUserId);
      } else {
        const userId = crypto.randomUUID();
        localStorage.setItem("khue's-userId", userId);

        setUserId(userId);
      }
    }
  }, [isLoaded, isSignedIn, clerkUserId]);

  return userId;
}

export default useGetUserId;

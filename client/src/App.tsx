import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { LocationProvider } from "./context/location-context";
import { useEffect, useState } from "react";
import HomePage from "@/pages/home";
import ExplorerPage from "@/pages/explorer";
import ArtistProfilePage from "@/pages/artist-profile";
import CreateArtistProfilePage from "@/pages/create-artist-profile";
import EventDetailsPage from "@/pages/event-details";
import EventCreatePage from "@/pages/event-create";
import FavoritesPage from "@/pages/favorites";
import ChatPage from "@/pages/chat";
import ProfilePage from "@/pages/profile";
import SearchPage from "@/pages/search";
import GeoRecommendationsPage from "@/pages/geo-recommendations";
import NotFound from "@/pages/not-found";
import RealTimeOffersPage from "@/pages/real-time-offers";
import BottomNavigation from "./components/bottom-navigation";
import LocationModal from "./components/location-modal";
import SettingsMenu from "./components/settings-menu";
import React from 'react';


function Router() {
  const [location] = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Check if location has been set before
    const hasSetLocation = localStorage.getItem("locationSet");
    if (!hasSetLocation) {
      setShowLocationModal(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      {showLocationModal && <LocationModal onComplete={() => setShowLocationModal(false)} />}

      <main className="flex-grow pb-16">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/explore" component={ExplorerPage} />
          <Route path="/artist/:id" component={ArtistProfilePage} />
          <Route path="/event/:id" component={EventDetailsPage} />
          <Route path="/create" component={EventCreatePage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/chat" component={ChatPage} />
          <Route path="/chat/:id" component={ChatPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/nearby" component={GeoRecommendationsPage} />
          <Route path="/real-time-offers" component={RealTimeOffersPage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {!location.includes('/create') && <BottomNavigation />}
      <SettingsMenu />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route path="/create-artist-profile" element={<CreateArtistProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
          <BottomNavigation />
          <Toaster />
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { LocationProvider } from "./context/location-context";
import HomePage from "@/pages/home";
import ExplorerPage from "@/pages/explorer";
import ArtistProfilePage from "@/pages/artist-profile";
import CreateArtistProfilePage from "@/pages/create-artist-profile";
import ProfilePage from "@/pages/profile";
import FavoritesPage from "@/pages/favorites";
import ChatPage from "@/pages/chat";
import EventDetailsPage from "@/pages/event-details";
import EventCreatePage from "@/pages/event-create";
import SearchPage from "@/pages/search";
import NotFound from "@/pages/not-found";
import BottomNavigation from "./components/bottom-navigation";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/explorer" component={ExplorerPage} />
            <Route path="/artist/:id" component={ArtistProfilePage} />
            <Route path="/create-artist-profile" component={CreateArtistProfilePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/favorites" component={FavoritesPage} />
            <Route path="/chat" component={ChatPage} />
            <Route path="/event/:id" component={EventDetailsPage} />
            <Route path="/event/create" component={EventCreatePage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/:rest*" component={NotFound} />
          </Switch>
          <BottomNavigation />
          <Toaster />
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

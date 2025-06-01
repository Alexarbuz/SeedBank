import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CollectionComponent } from './components/collection/collection.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SeedCardComponent } from './components/seedcard/seedcard.component';
import { AdminPanelComponent } from './components/adminpanel/adminpanel.component';
import { GenusComponent } from './components/genus/genus.component';
import { SpecieComponent } from './components/specie/specie.component';
import { PlaceComponent } from './components/place/place.component';
import { UsersComponent } from './components/users/users.component';
import { FamilyComponent } from './components/family/family.component';
import { ContactsComponent } from './components/contacts/contacts.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Главная по умолчанию
  { path: 'collection', component: CollectionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'profile', component: ProfileComponent },
  { path: 'seeds/:id', component: SeedCardComponent },
  { path: 'adminpanel', component: AdminPanelComponent},
  { path: 'adminpanel/family', component: FamilyComponent},
  { path: 'adminpanel/genus', component: GenusComponent},
  { path: 'adminpanel/specie', component: SpecieComponent},
  { path: 'adminpanel/place', component: PlaceComponent},
  { path: 'adminpanel/user', component: UsersComponent},
  { path: 'contacts', component: ContactsComponent}
];
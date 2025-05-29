import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
 imports: [
    FormsModule // ← Важно!
    ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userId: number | null = null;

  userData = {
    first_name: '',
    last_name: '',
    patronymic: '',
    login: '',
    password: ''
  
  };

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      // Не авторизован
      return;
    }

    try {
      const decoded: any = this.decodeToken(token);
      this.userId = decoded.id;

      // Загружаем данные пользователя
      this.http.get<any>(`http://localhost:5000/api/accounts/${this.userId}`).subscribe({
        next: (data) => {
          this.userData.first_name = data.first_name;
          this.userData.last_name = data.last_name;
          this.userData.patronymic = data.patronymic
          this.userData.login = data.login || '';
        },
        error: (err) => {
          console.error('Ошибка при загрузке профиля:', err);
        }
      });
    } catch (e) {
      console.error('Ошибка при декодировании токена:', e);
    }
  }

  decodeToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }

  saveChanges() {
    if (this.userId == null) return;

    const updatedData = {
      first_name: this.userData.first_name || undefined,
      last_name: this.userData.last_name || undefined,
      patronymic: this.userData.patronymic || undefined,
      login: this.userData.login || undefined, 
      password: this.userData.password || undefined // Не отправляем пустой пароль
    };

    this.http.put(`http://localhost:5000/api/accounts/${this.userId}`, updatedData).subscribe({
      next: () => alert('Данные успешно обновлены!'),
      error: (err) => console.error('Ошибка при сохранении:', err)
    });
  }
}
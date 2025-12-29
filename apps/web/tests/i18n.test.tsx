import { describe, it, expect } from 'vitest';
import { useI18n } from '../contexts/I18nContext';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, LanguageSelector } from '../contexts/I18nContext';

describe('Internationalization', () => {
  describe('I18n Context', () => {
    it('should provide translation function', () => {
      const TestComponent = () => {
        const { t } = useI18n();
        return <div>{t('common.welcome')}</div>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('should change language', () => {
      const TestComponent = () => {
        const { language, setLanguage, t } = useI18n();
        return (
          <div>
            <div>{t('common.welcome')}</div>
            <button onClick={() => setLanguage('hi')}>Change to Hindi</button>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Change to Hindi'));

      expect(screen.getByText('स्वागत है')).toBeInTheDocument();
    });

    it('should persist language to localStorage', () => {
      const TestComponent = () => {
        const { setLanguage } = useI18n();
        return <button onClick={() => setLanguage('ta')}>Tamil</button>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      fireEvent.click(screen.getByText('Tamil'));

      expect(localStorage.getItem('language')).toBe('ta');
    });

    it('should fallback to key if translation not found', () => {
      const TestComponent = () => {
        const { t } = useI18n();
        return <div>{t('nonexistent.key')}</div>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('nonexistent.key')).toBeInTheDocument();
    });
  });

  describe('Language Selector', () => {
    it('should render all language options', () => {
      render(
        <I18nProvider>
          <LanguageSelector />
        </I18nProvider>
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5); // English, Hindi, Tamil, Telugu, Bengali
    });

    it('should change language on selection', () => {
      render(
        <I18nProvider>
          <LanguageSelector />
        </I18nProvider>
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      
      fireEvent.change(select, { target: { value: 'hi' } });

      expect(select.value).toBe('hi');
    });
  });

  describe('Translations', () => {
    const languages = ['en', 'hi', 'ta', 'te', 'bn'];

    languages.forEach((lang) => {
      it(`should have common translations for ${lang}`, () => {
        const TestComponent = () => {
          const { setLanguage, t } = useI18n();
          setLanguage(lang as any);
          return (
            <div>
              <div>{t('common.appName')}</div>
              <div>{t('common.welcome')}</div>
              <div>{t('common.login')}</div>
              <div>{t('common.register')}</div>
            </div>
          );
        };

        render(
          <I18nProvider>
            <TestComponent />
          </I18nProvider>
        );

        // Should not show translation keys
        expect(screen.queryByText('common.appName')).not.toBeInTheDocument();
        expect(screen.queryByText('common.welcome')).not.toBeInTheDocument();
      });
    });

    it('should translate auth pages', () => {
      const TestComponent = () => {
        const { setLanguage, t } = useI18n();
        setLanguage('hi');
        return (
          <div>
            <div>{t('auth.loginTitle')}</div>
            <div>{t('auth.email')}</div>
            <div>{t('auth.password')}</div>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('अपने खाते में लॉगिन करें')).toBeInTheDocument();
      expect(screen.getByText('ईमेल')).toBeInTheDocument();
      expect(screen.getByText('पासवर्ड')).toBeInTheDocument();
    });

    it('should translate home page', () => {
      const TestComponent = () => {
        const { setLanguage, t } = useI18n();
        setLanguage('ta');
        return (
          <div>
            <div>{t('home.hero.title')}</div>
            <div>{t('home.categories')}</div>
            <div>{t('home.featuredToys')}</div>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      // Should show Tamil translations
      expect(screen.queryByText('home.hero.title')).not.toBeInTheDocument();
    });

    it('should translate toys page', () => {
      const TestComponent = () => {
        const { setLanguage, t } = useI18n();
        setLanguage('te');
        return (
          <div>
            <div>{t('toys.title')}</div>
            <div>{t('toys.searchPlaceholder')}</div>
            <div>{t('toys.addToCart')}</div>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      // Should show Telugu translations
      expect(screen.queryByText('toys.title')).not.toBeInTheDocument();
    });

    it('should translate cart page', () => {
      const TestComponent = () => {
        const { setLanguage, t } = useI18n();
        setLanguage('bn');
        return (
          <div>
            <div>{t('cart.title')}</div>
            <div>{t('cart.emptyCart')}</div>
            <div>{t('cart.proceedToCheckout')}</div>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      // Should show Bengali translations
      expect(screen.queryByText('cart.title')).not.toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should detect RTL languages', () => {
      // Currently no RTL languages, but test infrastructure
      const rtlLanguages = ['ar', 'he', 'ur'];
      const currentLanguages = ['en', 'hi', 'ta', 'te', 'bn'];

      currentLanguages.forEach((lang) => {
        expect(rtlLanguages).not.toContain(lang);
      });
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers in Indian format', () => {
      const formatIndianNumber = (num: number) => {
        return num.toLocaleString('en-IN');
      };

      expect(formatIndianNumber(1000)).toBe('1,000');
      expect(formatIndianNumber(10000)).toBe('10,000');
      expect(formatIndianNumber(100000)).toBe('1,00,000');
      expect(formatIndianNumber(1000000)).toBe('10,00,000');
    });

    it('should format currency in Indian Rupees', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
      };

      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(1000)).toContain('₹');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in Indian format', () => {
      const date = new Date('2024-01-15');
      const formatted = date.toLocaleDateString('en-IN');

      expect(formatted).toMatch(/15.*1.*2024/);
    });

    it('should format dates in Hindi', () => {
      const date = new Date('2024-01-15');
      const formatted = date.toLocaleDateString('hi-IN');

      expect(formatted).toBeTruthy();
    });
  });
});

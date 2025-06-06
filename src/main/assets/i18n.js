/**
 * Internationalization (i18n) system for New Tab Page
 * Provides automatic language detection and translation functionality
 */

class I18n {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.loadTranslations();
    }

    /**
     * Detect user's preferred language from browser settings
     */
    detectLanguage() {
        // Get browser language, fallback to English
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        // Extract language code (e.g., 'en-US' -> 'en')
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Supported languages
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
        
        return supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    /**
     * Load translation data for all supported languages
     */
    loadTranslations() {
        this.translations = {
            en: {
                // Common
                'search': 'Search',
                'search_web': 'Search the web',
                'settings': 'Settings',
                'cancel': 'Cancel',
                'save': 'Save',
                'apply': 'Apply',
                'delete': 'Delete',
                'edit': 'Edit',
                'add': 'Add',
                'remove': 'Remove',
                'reset': 'Reset',
                'close': 'Close',
                'yes': 'Yes',
                'no': 'No',

                // New Tab Page
                'new_tab': 'New Tab',
                'gmail': 'Gmail',
                'photos': 'Photos',
                'search_labs': 'Search Labs',
                'google_apps': 'Google apps',

                // Settings Page
                'new_tab_settings': 'New Tab Settings',
                'save_settings': 'Save Settings',
                'customize_layout': 'Customize Layout',
                'theme_settings': 'Theme Settings',
                'custom_theme_colors': 'Custom Theme Colors',
                'custom_theme_name': 'Custom Theme Name',
                'my_custom_theme': 'My Custom Theme',
                'primary': 'Primary',
                'secondary': 'Secondary',
                'accent': 'Accent',
                'text': 'Text',
                'background': 'Background',
                'save_custom_theme': 'Save Custom Theme',
                'use_glass_background': 'Use glass background',
                'use_custom_background': 'Use Custom Background',
                'background_url': 'Background URL',
                'enter_image_url': 'Enter image URL...',
                'upload_image': 'Or Upload Image',
                'choose_file': 'Choose File',
                'no_file_chosen': 'No file chosen',
                'background_preview': 'Background preview',
                'display_settings': 'Display Settings',
                'show_search_bar': 'Show Search Bar',
                'default_search_engine': 'Default Search Engine',
                'google': 'Google',
                'bing': 'Bing',
                'duckduckgo': 'DuckDuckGo',
                'yahoo': 'Yahoo',
                'accessibility_settings': 'Accessibility Settings',
                'font_size': 'Font Size',
                'global_scale': 'Global Scale',
                'reset_options': 'Reset Options',
                'issues_feedback': 'Issues and Feedback',
                'reset_settings_default': 'Reset Settings to Default',
                'reset_layout': 'Reset Layout',
                'reset_description': 'Resetting the New Tab Page will remove all custom link groups and restore default search bar position.',

                // Editor Page
                'edit_new_tab': 'Edit - New Tab',
                'return_to_settings': '← Return to settings',
                'edit_header': 'Edit Header',
                'search_bar': 'Search Bar',
                'add_new_content': 'Add New Content',
                'toggle_drag_mode': 'Toggle Drag Mode',
                'save_changes': 'Save Changes',
                'add_new_group': 'Add New Group',
                'add_widget': 'Add Widget',
                'group_settings': 'Group Settings',
                'group_title': 'Group Title',
                'stack': 'Stack',
                'grid': 'Grid',
                'single': 'Single',
                'rows': 'Rows',
                'columns': 'Columns',
                'add_link': 'Add Link',
                'apply_new_group': 'Apply New Group',
                'manage_apps': 'Manage Apps',
                'customize_apps_desc': 'Customize the apps that appear in your apps grid dropdown.',
                'add_app': 'Add App',
                'edit_app': 'Edit App',
                'app_name': 'App Name',
                'app_name_example': 'e.g. Gmail',
                'url': 'URL',
                'url_example': 'e.g. https://mail.google.com',
                'icon_url': 'Icon URL',
                'icon_url_example': 'e.g. https://example.com/icon.png',
                'icon_help': 'Enter a URL to an icon image (preferred size: 32x32px)',
                'edit_header_links': 'Edit Header Links',
                'customize_header_desc': 'Customize the links in your header navigation bar.',
                'add_header_link': 'Add Link',
                'edit_header_link': 'Edit Header Link',
                'link_text': 'Link Text',

                // Widget
                'analog_clock': 'Analog Clock'
            },

            es: {
                // Common
                'search': 'Buscar',
                'search_web': 'Buscar en la web',
                'settings': 'Configuración',
                'cancel': 'Cancelar',
                'save': 'Guardar',
                'apply': 'Aplicar',
                'delete': 'Eliminar',
                'edit': 'Editar',
                'add': 'Añadir',
                'remove': 'Quitar',
                'reset': 'Restablecer',
                'close': 'Cerrar',
                'yes': 'Sí',
                'no': 'No',

                // New Tab Page
                'new_tab': 'Nueva Pestaña',
                'gmail': 'Gmail',
                'photos': 'Fotos',
                'search_labs': 'Labs de Búsqueda',
                'google_apps': 'Apps de Google',

                // Settings Page
                'new_tab_settings': 'Configuración de Nueva Pestaña',
                'save_settings': 'Guardar Configuración',
                'customize_layout': 'Personalizar Diseño',
                'theme_settings': 'Configuración de Tema',
                'custom_theme_colors': 'Colores de Tema Personalizado',
                'custom_theme_name': 'Nombre del Tema Personalizado',
                'my_custom_theme': 'Mi Tema Personalizado',
                'primary': 'Primario',
                'secondary': 'Secundario',
                'accent': 'Acento',
                'text': 'Texto',
                'background': 'Fondo',
                'save_custom_theme': 'Guardar Tema Personalizado',
                'use_glass_background': 'Usar fondo de cristal',
                'use_custom_background': 'Usar Fondo Personalizado',
                'background_url': 'URL del Fondo',
                'enter_image_url': 'Ingresa URL de imagen...',
                'upload_image': 'O Subir Imagen',
                'choose_file': 'Elegir Archivo',
                'no_file_chosen': 'Ningún archivo elegido',
                'background_preview': 'Vista previa del fondo',
                'display_settings': 'Configuración de Pantalla',
                'show_search_bar': 'Mostrar Barra de Búsqueda',
                'default_search_engine': 'Motor de Búsqueda Predeterminado',
                'google': 'Google',
                'bing': 'Bing',
                'duckduckgo': 'DuckDuckGo',
                'yahoo': 'Yahoo',
                'accessibility_settings': 'Configuración de Accesibilidad',
                'font_size': 'Tamaño de Fuente',
                'global_scale': 'Escala Global',
                'reset_options': 'Opciones de Restablecimiento',
                'issues_feedback': 'Problemas y Comentarios',
                'reset_settings_default': 'Restablecer Configuración por Defecto',
                'reset_layout': 'Restablecer Diseño',
                'reset_description': 'Restablecer la Nueva Pestaña eliminará todos los grupos de enlaces personalizados y restaurará la posición predeterminada de la barra de búsqueda.',

                // Editor Page
                'edit_new_tab': 'Editar - Nueva Pestaña',
                'return_to_settings': '← Volver a configuración',
                'edit_header': 'Editar Encabezado',
                'search_bar': 'Barra de Búsqueda',
                'add_new_content': 'Añadir Nuevo Contenido',
                'toggle_drag_mode': 'Alternar Modo de Arrastre',
                'save_changes': 'Guardar Cambios',
                'add_new_group': 'Añadir Nuevo Grupo',
                'add_widget': 'Añadir Widget',
                'group_settings': 'Configuración de Grupo',
                'group_title': 'Título del Grupo',
                'stack': 'Pila',
                'grid': 'Cuadrícula',
                'single': 'Individual',
                'rows': 'Filas',
                'columns': 'Columnas',
                'add_link': 'Añadir Enlace',
                'apply_new_group': 'Aplicar Nuevo Grupo',
                'manage_apps': 'Gestionar Apps',
                'customize_apps_desc': 'Personaliza las aplicaciones que aparecen en tu menú desplegable de apps.',
                'add_app': 'Añadir App',
                'edit_app': 'Editar App',
                'app_name': 'Nombre de la App',
                'app_name_example': 'ej. Gmail',
                'url': 'URL',
                'url_example': 'ej. https://mail.google.com',
                'icon_url': 'URL del Icono',
                'icon_url_example': 'ej. https://example.com/icon.png',
                'icon_help': 'Ingresa una URL a una imagen de icono (tamaño preferido: 32x32px)',
                'edit_header_links': 'Editar Enlaces del Encabezado',
                'customize_header_desc': 'Personaliza los enlaces en tu barra de navegación del encabezado.',
                'add_header_link': 'Añadir Enlace',
                'edit_header_link': 'Editar Enlace del Encabezado',
                'link_text': 'Texto del Enlace',

                // Widget
                'analog_clock': 'Reloj Analógico'
            },

            fr: {
                // Common
                'search': 'Rechercher',
                'search_web': 'Rechercher sur le web',
                'settings': 'Paramètres',
                'cancel': 'Annuler',
                'save': 'Enregistrer',
                'apply': 'Appliquer',
                'delete': 'Supprimer',
                'edit': 'Modifier',
                'add': 'Ajouter',
                'remove': 'Retirer',
                'reset': 'Réinitialiser',
                'close': 'Fermer',
                'yes': 'Oui',
                'no': 'Non',

                // New Tab Page
                'new_tab': 'Nouvel Onglet',
                'gmail': 'Gmail',
                'photos': 'Photos',
                'search_labs': 'Labs de Recherche',
                'google_apps': 'Apps Google',

                // Settings Page
                'new_tab_settings': 'Paramètres du Nouvel Onglet',
                'save_settings': 'Enregistrer les Paramètres',
                'customize_layout': 'Personnaliser la Mise en Page',
                'theme_settings': 'Paramètres du Thème',
                'custom_theme_colors': 'Couleurs du Thème Personnalisé',
                'custom_theme_name': 'Nom du Thème Personnalisé',
                'my_custom_theme': 'Mon Thème Personnalisé',
                'primary': 'Primaire',
                'secondary': 'Secondaire',
                'accent': 'Accent',
                'text': 'Texte',
                'background': 'Arrière-plan',
                'save_custom_theme': 'Enregistrer le Thème Personnalisé',
                'use_glass_background': 'Utiliser un arrière-plan en verre',
                'use_custom_background': 'Utiliser un Arrière-plan Personnalisé',
                'background_url': 'URL de l\'Arrière-plan',
                'enter_image_url': 'Entrez l\'URL de l\'image...',
                'upload_image': 'Ou Télécharger une Image',
                'choose_file': 'Choisir un Fichier',
                'no_file_chosen': 'Aucun fichier choisi',
                'background_preview': 'Aperçu de l\'arrière-plan',
                'display_settings': 'Paramètres d\'Affichage',
                'show_search_bar': 'Afficher la Barre de Recherche',
                'default_search_engine': 'Moteur de Recherche par Défaut',
                'google': 'Google',
                'bing': 'Bing',
                'duckduckgo': 'DuckDuckGo',
                'yahoo': 'Yahoo',
                'accessibility_settings': 'Paramètres d\'Accessibilité',
                'font_size': 'Taille de Police',
                'global_scale': 'Échelle Globale',
                'reset_options': 'Options de Réinitialisation',
                'issues_feedback': 'Problèmes et Commentaires',
                'reset_settings_default': 'Réinitialiser les Paramètres par Défaut',
                'reset_layout': 'Réinitialiser la Mise en Page',
                'reset_description': 'La réinitialisation du Nouvel Onglet supprimera tous les groupes de liens personnalisés et restaurera la position par défaut de la barre de recherche.',

                // Widget
                'analog_clock': 'Horloge Analogique'
            },

            de: {
                // Common
                'search': 'Suchen',
                'search_web': 'Im Web suchen',
                'settings': 'Einstellungen',
                'cancel': 'Abbrechen',
                'save': 'Speichern',
                'apply': 'Anwenden',
                'delete': 'Löschen',
                'edit': 'Bearbeiten',
                'add': 'Hinzufügen',
                'remove': 'Entfernen',
                'reset': 'Zurücksetzen',
                'close': 'Schließen',
                'yes': 'Ja',
                'no': 'Nein',

                // New Tab Page
                'new_tab': 'Neuer Tab',
                'gmail': 'Gmail',
                'photos': 'Fotos',
                'search_labs': 'Search Labs',
                'google_apps': 'Google Apps',

                // Settings Page
                'new_tab_settings': 'Neuer Tab Einstellungen',
                'save_settings': 'Einstellungen Speichern',
                'customize_layout': 'Layout Anpassen',
                'theme_settings': 'Theme-Einstellungen',
                'custom_theme_colors': 'Benutzerdefinierte Theme-Farben',
                'custom_theme_name': 'Benutzerdefinierter Theme-Name',
                'my_custom_theme': 'Mein Benutzerdefiniertes Theme',
                'primary': 'Primär',
                'secondary': 'Sekundär',
                'accent': 'Akzent',
                'text': 'Text',
                'background': 'Hintergrund',
                'save_custom_theme': 'Benutzerdefiniertes Theme Speichern',
                'use_glass_background': 'Glas-Hintergrund verwenden',
                'use_custom_background': 'Benutzerdefinierten Hintergrund Verwenden',
                'background_url': 'Hintergrund-URL',
                'enter_image_url': 'Bild-URL eingeben...',
                'upload_image': 'Oder Bild Hochladen',
                'choose_file': 'Datei Auswählen',
                'no_file_chosen': 'Keine Datei ausgewählt',
                'background_preview': 'Hintergrund-Vorschau',
                'display_settings': 'Anzeige-Einstellungen',
                'show_search_bar': 'Suchleiste Anzeigen',
                'default_search_engine': 'Standard-Suchmaschine',
                'google': 'Google',
                'bing': 'Bing',
                'duckduckgo': 'DuckDuckGo',
                'yahoo': 'Yahoo',
                'accessibility_settings': 'Barrierefreiheits-Einstellungen',
                'font_size': 'Schriftgröße',
                'global_scale': 'Globale Skalierung',
                'reset_options': 'Zurücksetzungsoptionen',
                'issues_feedback': 'Probleme und Feedback',
                'reset_settings_default': 'Einstellungen auf Standard Zurücksetzen',
                'reset_layout': 'Layout Zurücksetzen',
                'reset_description': 'Das Zurücksetzen des Neuen Tabs entfernt alle benutzerdefinierten Link-Gruppen und stellt die Standardposition der Suchleiste wieder her.',

                // Widget
                'analog_clock': 'Analoge Uhr'
            }
        };
    }

    /**
     * Get translated text for a given key
     */
    t(key, fallback = null) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations[this.fallbackLanguage]?.[key] || 
                          fallback || 
                          key;
        return translation;
    }

    /**
     * Set the current language
     */
    setLanguage(langCode) {
        if (this.translations[langCode]) {
            this.currentLanguage = langCode;
            this.updatePageTranslations();
        }
    }

    /**
     * Update all elements with data-i18n attributes
     */
    updatePageTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // Update title attribute translations
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Update alt attribute translations
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            element.alt = this.t(key);
        });

        // Update aria-label attribute translations
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            element.setAttribute('aria-label', this.t(key));
        });

        // Update document title if it has translation
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            document.title = this.t(key);
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    /**
     * Initialize internationalization on page load
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePageTranslations();
            });
        } else {
            this.updatePageTranslations();
        }
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Auto-initialize when script loads
window.i18n.init();
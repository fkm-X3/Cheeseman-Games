using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using Cheeseman_Games.Models;

namespace Cheeseman_Games;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        LoadGames();
    }

    private void LoadGames()
    {
        GamesList.ItemsSource = new List<GameInfo>
        {
            new()
            {
                Name = "Snake",
                Description = "Guide the snake to eat food and grow without crashing into walls or yourself.",
                Emoji = "🐍",
                AccentColor = Colors.LimeGreen,
            },
            new()
            {
                Name = "Tic-Tac-Toe",
                Description = "Classic 3-in-a-row. Play against a friend or the computer.",
                Emoji = "❌",
                AccentColor = Colors.DodgerBlue,
            },
            new()
            {
                Name = "Memory Match",
                Description = "Flip cards and find matching pairs. Test your memory!",
                Emoji = "🧠",
                AccentColor = Colors.MediumPurple,
            },
            new()
            {
                Name = "Blackjack",
                Description = "Try to beat the dealer without going over 21.",
                Emoji = "🃏",
                AccentColor = Colors.Goldenrod,
            },
            new()
            {
                Name = "Pong",
                Description = "Classic paddle ball game. Play against AI or a friend.",
                Emoji = "🏓",
                AccentColor = Colors.Tomato,
            },
            new()
            {
                Name = "Wordle",
                Description = "Guess the 5-letter word in 6 tries. A daily word puzzle.",
                Emoji = "🔤",
                AccentColor = Colors.SeaGreen,
            },
            new()
            {
                Name = "Asteroids",
                Description = "Blast asteroids in this space shooter arcade classic.",
                Emoji = "☄️",
                AccentColor = Colors.OrangeRed,
            },
            new()
            {
                Name = "Minesweeper",
                Description = "Clear the minefield without detonating any mines.",
                Emoji = "💣",
                AccentColor = Colors.SteelBlue,
            },
            new()
            {
                Name = "Chess",
                Description = "Coming soon — the classic strategy game.",
                Emoji = "♟️",
                IsAvailable = false,
                AccentColor = Colors.Gray,
            },
        };
    }

    private void GameCard_Click(object sender, MouseButtonEventArgs e)
    {
        if (sender is not Border border) return;

        var context = border.DataContext as GameInfo;
        if (context is null) return;

        if (!context.IsAvailable)
        {
            MessageBox.Show($"\"{context.Name}\" is coming soon! Stay tuned.", "Coming Soon",
                MessageBoxButton.OK, MessageBoxImage.Information);
            return;
        }

        MessageBox.Show($"Launching {context.Name}...\n\nGame implementation coming in a future update.",
            "Cheeseman Games", MessageBoxButton.OK, MessageBoxImage.Information);
    }
}



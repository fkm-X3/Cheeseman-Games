using System.Windows.Media;

namespace Cheeseman_Games.Models;

public class GameInfo
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Emoji { get; set; } = "🎮";
    public bool IsAvailable { get; set; } = true;
    public Color AccentColor { get; set; } = Colors.DodgerBlue;
}

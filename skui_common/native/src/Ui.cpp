

#include <string>
#include <experimental/filesystem>
#include <iomanip>
#include <fstream>

namespace fs = std::experimental::filesystem;
#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))


bool convertFromBin(fs::path &fromPath, fs::path &toPath, uint32_t width, uint32_t height, uint32_t depth)
  {
    std::stringstream command;
    command << "convert -size ";
    command << width;
    command << "x";
    command << height;
    command << " -depth ";
    command << depth;
    command << " ";
    command << " RGBA:";
    command << std::quoted(fromPath.string());
    command << " ";
    command << std::quoted(toPath.string());
    std::string strCommand = command.str();
    // std::cout << strCommand << std::endl;
    auto fp = popen(strCommand.c_str(), "r");
    if (fp != nullptr)
    {
      auto status = pclose(fp);
      return status == 0;
    };
    return false;
  }


bool saveImage(std::string &strPath, const char *data, uint32_t width, uint32_t height)
  {
    auto size = width * height * 4;
    fs::path fspath = strPath;
    fs::path fsrawpath = strPath + ".raw";
    fs::create_directories(fsrawpath.parent_path());
    try
    {
      std::ofstream ofs(fsrawpath, std::ios::binary);
      ofs.write(data, size);
      ofs.close();
      auto res = convertFromBin(fsrawpath, fspath, width, height, 8);
      fs::remove(fsrawpath);
      return res;
    }
    catch (...)
    {
      return false;
    }
  }

extern "C"
{

uint32_t SKIP_getStringsSize(void *source);
uint32_t SKIP_String_byteSize(const char *str);

bool SKIP_Ui_saveImage(char *path, const void *data, uint32_t width, uint32_t height)
{
  TXT(path, strPath);
  return saveImage(strPath, (const char *)data, width, height);
}

}
#include <iostream>
#include <stdexcept>
#include <stdio.h>
#include <string>
#include <vector>

#if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
    #include <windows.h>
#else
    #include <unistd.h>
#endif

using namespace std;

string exec(string command) {
   char buffer[128];
   string result = "";

   // Open pipe to file
   FILE* pipe = popen(command.c_str(), "r");
   if (!pipe) {
      return "popen failed!";
   }

   // read till end of process:
   while (!feof(pipe)) {

      // use buffer to read and add to result
      if (fgets(buffer, 128, pipe) != NULL)
         result += buffer;
   }

   pclose(pipe);
   return result;
}

int main(int argc, char* argv[]) { 
    string type = argv[1];
    string url = argv[2];
    string location = argv[3];
    string branch = argv[4];

    string cmd = type + " clone " + url + " " + location + (type == "hg" ? " -r " + branch : " --branch " + branch);

    cout << ("\x1B[35m(get.cpp)\033[0m Executing `" + cmd + "`.") << "\n\n";

    #if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
        Sleep(1000);
    #else
        usleep(1000);
    #endif

    string ls = exec(cmd);

    cout << ls;
}
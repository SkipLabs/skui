#include <math.h>

extern "C" {
double SKIP_Math_atan2(double y, double x) { return std::atan2(y, x); }

double SKIP_Math_tan(double a) { return std::atan(a); }

double SKIP_Math_arcCos(double x) { return std::acos(x); }

double SKIP_Math_cbrt(double a) { return std::cbrt(a); }

double SKIP_Math_log(double a) { return std::log(a); }

double SKIP_Math_log10(double a) { return std::log10(a); }

double SKIP_Math_exp(double a) { return std::exp(a); }
}
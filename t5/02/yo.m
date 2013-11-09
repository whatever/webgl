X = [ -100:100 ] / 100;
F = fft(f(X));

x = X;


function y = f(x)
  y = (1 - x .^ 2.0) .^ 0.5;
endfunction

size(F)

function y = f_approx (x)
  y = (1 .- x .^ 2.0) .^ 0.5;
endfunction

y = f_approx(X);

% y(201)

% f_approx(X)

% plot(X, f(X))
% plot(X, f_approx(X))
